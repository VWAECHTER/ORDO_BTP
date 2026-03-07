import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  projectId: string;
}

interface Metadata {
  objet: string;
  maitrise_oeuvre: string;
  montant: string;
  delais: string;
}

interface DCEDocument {
  piece: string;
  description: string;
}

interface StrategicPillar {
  title: string;
  points: string[];
}

interface StrategicAnalysis {
  piliers: StrategicPillar[];
}

interface BlockingQuestion {
  question: string;
  importance: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { projectId }: AnalysisRequest = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "projectId is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: documents, error: docsError } = await supabase
      .from("project_documents")
      .select("file_name, file_type, file_size")
      .eq("project_id", projectId);

    if (docsError) throw docsError;

    const documentsList = documents?.map((doc) =>
      `- ${doc.file_name} (${doc.file_type}, ${(doc.file_size / 1024).toFixed(1)} KB)`
    ).join("\n") || "";

    const prompt = `Tu es un expert en analyse d'appels d'offres dans le BTP. Analyse ce dossier et fournis UNIQUEMENT une réponse JSON structurée selon ce format exact :

Documents du DCE :
${documentsList}

Format de réponse attendu (JSON strict, pas de texte avant ou après) :
{
  "metadata": {
    "objet": "Description de l'objet du marché",
    "maitrise_oeuvre": "Nom de la maîtrise d'oeuvre",
    "montant": "Montant estimatif",
    "delais": "Délais d'exécution"
  },
  "dce_map": [
    {"piece": "Nom de la pièce 1", "description": "Description en 1 ligne"},
    {"piece": "Nom de la pièce 2", "description": "Description en 1 ligne"}
  ],
  "strategic_analysis": {
    "piliers": [
      {
        "title": "Pilier 1 : Titre",
        "points": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "Pilier 2 : Titre",
        "points": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "Pilier 3 : Titre",
        "points": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "Pilier 4 : Titre",
        "points": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "Pilier 5 : Titre",
        "points": ["Point 1", "Point 2", "Point 3"]
      }
    ]
  },
  "blocking_questions": [
    {"question": "Question bloquante 1", "importance": "Critique"},
    {"question": "Question bloquante 2", "importance": "Important"}
  ]
}

Les 5 piliers doivent couvrir : compétences techniques, moyens humains/matériels, conformité réglementaire, capacité financière, et méthodologie/planning.

QUESTIONS BLOQUANTES (OBLIGATOIRE) :
- Liste TOUTES les informations manquantes ou imprécises du DCE nécessaires pour candidater
- Questions pour le MOE/MO (maître d'œuvre/maître d'ouvrage)
- Questions pour l'entreprise (ressources internes, capacités)
- Minimum 5-7 questions bloquantes identifiées
- Format : {"question": "texte précis", "importance": "Critique" ou "Important"}

NE GÉNÈRE PAS de mémoire technique. C'est une ANALYSE STRATÉGIQUE uniquement.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse d'appels d'offres BTP. Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const analysisText = openaiData.choices[0].message.content.trim();

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse analysis response");
      }
    }

    const { error: insertError } = await supabase
      .from("project_analysis")
      .insert({
        project_id: projectId,
        metadata: analysis.metadata || {},
        dce_map: analysis.dce_map || [],
        strategic_analysis: analysis.strategic_analysis || {},
        blocking_questions: analysis.blocking_questions || [],
        analysis_status: "completed",
      });

    if (insertError) throw insertError;

    await supabase
      .from("projects")
      .update({ status: "analyzing" })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error analyzing documents:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
