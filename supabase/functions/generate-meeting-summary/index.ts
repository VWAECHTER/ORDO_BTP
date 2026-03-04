import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SummaryRequest {
  transcript: string;
  recordingId: string;
  meetingTitle?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transcript, recordingId, meetingTitle }: SummaryRequest = await req.json();

    if (!transcript || !recordingId) {
      return new Response(
        JSON.stringify({ error: "Missing transcript or recordingId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `Tu es un assistant professionnel spécialisé dans la rédaction de comptes-rendus de réunion.

Analyse la transcription suivante et génère un compte-rendu structuré en français professionnel.

Le compte-rendu doit contenir :
1. Un titre (utilise "${meetingTitle || 'Réunion'}" si fourni)
2. Date et heure
3. Un résumé exécutif (2-3 phrases)
4. Les points clés abordés (liste à puces)
5. Les décisions prises
6. Les actions à entreprendre (avec responsables si mentionnés)
7. Les prochaines étapes

Format le résultat en Markdown pour une meilleure lisibilité.

Transcription :
${transcript}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant professionnel expert en rédaction de comptes-rendus de réunion. Tu produis des documents clairs, structurés et professionnels en français.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    return new Response(
      JSON.stringify({
        recordingId,
        summary,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Summary generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Summary generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
