import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MemoRequest {
  projectId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { projectId }: MemoRequest = await req.json();

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

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    const { data: analysis, error: analysisError } = await supabase
      .from("project_analysis")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (analysisError || !analysis) {
      throw new Error("Analysis not found. Please run analysis first.");
    }

    const metadata = analysis.metadata || {};
    const strategicAnalysis = analysis.strategic_analysis || { piliers: [] };
    const blockingQuestions = analysis.blocking_questions || [];

    const categoryLower = (project.category || "").toLowerCase();
    let modesOperatoiresGuidance = "";

    if (categoryLower.includes("go") || categoryLower.includes("bâtiment")) {
      modesOperatoiresGuidance = `
Pour GO/Bâtiment, couvre (si le DCE le demande) :
- Installation de chantier
- Implantation
- Terrassement et fondations
- Coffrage et ferraillage
- Bétonnage (vibration/cure)
- Réservations et scellements
- Maçonnerie
- Étanchéité si concernée
- Finitions liées au lot
- Points d'arrêt et contrôles`;
    } else if (categoryLower.includes("génie civil") || categoryLower.includes("genie civil")) {
      modesOperatoiresGuidance = `
Pour Génie Civil, couvre :
- Terrassements
- Stabilité
- Radiers et voiles
- Béton armé (BA)
- Reprises et joints
- Étanchéité
- Pompage/épuisement si mentionné
- Essais et contrôles
- EXE/notes/visas si requis`;
    } else if (categoryLower.includes("oa") || categoryLower.includes("pont") || categoryLower.includes("ouvrage d'art")) {
      modesOperatoiresGuidance = `
Pour OA/Pont, couvre :
- Accès et levage
- Interventions sur appuis et tablier selon CCTP
- Étanchéité, joints et équipements si mentionnés
- Points d'arrêt
- Contrôles et essais
- Tolérances
- Contraintes sous circulation si imposées`;
    } else if (categoryLower.includes("vrd") || categoryLower.includes("tp") || categoryLower.includes("travaux publics")) {
      modesOperatoiresGuidance = `
Pour VRD/TP, couvre :
- DICT et sondages si mentionnés
- Terrassement
- Blindage si requis
- Pose des réseaux
- Remblai et compactage
- Contrôles et essais si exigés
- Récolement
- Signalisation et relations riverains si concernés`;
    } else {
      modesOperatoiresGuidance = `
Adapte les modes opératoires selon le type de projet et les exigences du CCTP :
- Méthodologie détaillée pour chaque phase de travaux
- Techniques et procédures spécifiques
- Séquencement des opérations
- Contrôles et points d'arrêt`;
    }

    const prompt = `Tu es un expert en rédaction de mémoires techniques pour le BTP. Génère un mémoire technique professionnel selon ce plan STRICT :

CONTEXTE DU PROJET:
- Catégorie: ${project.category}
- Nom: ${project.name}
- Description: ${project.description}
- Objet: ${metadata.objet || "Non spécifié"}
- Maîtrise d'oeuvre: ${metadata.maitrise_oeuvre || "Non spécifié"}
- Montant: ${metadata.montant || "Non spécifié"}
- Délais: ${metadata.delais || "Non spécifié"}

ANALYSE STRATÉGIQUE:
${strategicAnalysis.piliers?.map((p: { title: string; points: string[] }, i: number) =>
  `${i + 1}. ${p.title}\n${p.points.map((pt: string) => `   - ${pt}`).join("\n")}`
).join("\n\n") || "Aucune analyse disponible"}

QUESTIONS BLOQUANTES:
${blockingQuestions.map((q: { question: string; importance: string }) =>
  `- [${q.importance}] ${q.question}`
).join("\n") || "Aucune question bloquante"}

STRUCTURE STRICTE DU MÉMOIRE (ne change jamais cette structure) :

**1. Préambule**
   - Objet du marché
   - Acteurs du projet (entreprise, maîtrise d'oeuvre, maîtrise d'ouvrage)
   - Documents de référence (CCTP, CCAP, plans, etc.)

**2. Synthèse de l'offre**
   - Critères d'attribution et exigences principales
   - Points forts de notre offre
   - Notre compréhension du projet

**3. Enjeux & préparation du chantier**
   - DICT (Déclaration d'Intention de Commencement de Travaux)
   - Repérages préalables (réseaux, amiante, plomb selon contexte)
   - EXE (plans d'exécution) si requis par le marché

**4. Modes opératoires**
   (Cette section DOIT être adaptée selon la catégorie ci-dessous)
   ${modesOperatoiresGuidance}

**5. Phasage & maintien de la circulation/exploitation**
   (Si imposé par le marché)
   - Planning détaillé par phase
   - Dispositifs de maintien de la circulation
   - Mesures pour la continuité d'exploitation

**6. Organisation & moyens**
   - Équipes : composition, qualification, encadrement
   - Matériels : engins, outillage, véhicules par catégories
   - Logistique et approvisionnements

**7. QSE & Environnement**
   - Qualité : procédures et contrôles qualité
   - Sécurité : analyse des risques, mesures de prévention, PPSPS
   - Environnement : gestion des déchets, nuisances, protection
   - Contrôles et PV (procès-verbaux) requis

**Conclusion : Actions clés & Questions bloquantes**
   (OBLIGATOIRE)
   - Récapitulatif des actions prioritaires (minimum 8 actions)
   - Liste des questions bloquantes à lever avant démarrage (minimum 7 questions)
   - Total combiné : au moins 15 items

EXIGENCES DE LONGUEUR (NON NÉGOCIABLE) :
- Le mémoire DOIT correspondre à un équivalent de 15 pages A4 minimum
- Sections 1 & 2 : 600-900 mots CHACUNE
- Section 3 : 600-900 mots
- Section 4 : 2000-3000 mots (la plus développée)
- Sections 5, 6 & 7 : 800-1200 mots CHACUNE
- Conclusion : au moins 15 items (actions + questions)

TABLEAUX À INTÉGRER (si pertinent selon DCE) :
- Tableau des moyens humains (fonction, qualification, nombre)
- Tableau des moyens matériels (équipement, quantité, usage)
- Tableau des points d'arrêt et contrôles/PV
- Tableau de phasage macro (phases, durée, activités principales)
- Si information absente du DCE : indiquer "Non spécifié dans le DCE" et formuler une question

IMPORTANT:
- Génère un mémoire COMPLET, professionnel et DÉTAILLÉ
- NE FAIS PAS COURT : chaque section doit respecter les comptages de mots minimums
- Utilise des termes techniques appropriés au BTP
- Sois factuel et orienté chantier, basé sur le DCE
- Pas de remplissage artificiel : contenu technique dense et pertinent
- Adapte UNIQUEMENT la section 4 (Modes opératoires) selon la catégorie du projet
- Toutes les autres sections restent identiques dans leur structure
- Format: Markdown avec titres, sous-titres et tableaux clairs`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en rédaction de mémoires techniques pour le BTP. Tu génères des documents professionnels, détaillés et conformes aux exigences des marchés publics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const memoContent = openaiData.choices[0].message.content.trim();

    const { data: existingMemo } = await supabase
      .from("technical_memos")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const newVersion = existingMemo ? (existingMemo.version || 0) + 1 : 1;

    const { error: insertError } = await supabase
      .from("technical_memos")
      .insert({
        project_id: projectId,
        content: memoContent,
        version: newVersion,
      });

    if (insertError) throw insertError;

    await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({ success: true, content: memoContent, version: newVersion }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating technical memo:", error);
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
