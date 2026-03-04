import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PDFRequest {
  recordingId: string;
  summary: string;
  title: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recordingId, summary, title }: PDFRequest = await req.json();

    if (!recordingId || !summary) {
      return new Response(
        JSON.stringify({ error: "Missing recordingId or summary" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const htmlContent = generateHTMLContent(summary, title);
    const pdfBytes = await generatePDFFromHTML(htmlContent);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `meeting-reports/${recordingId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("meeting-recordings")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("meeting-recordings")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        recordingId,
        pdfUrl: urlData.publicUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "PDF generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateHTMLContent(summary: string, title: string): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const summaryHTML = summary
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>(?![\s]*<li>)/g, '</li></ul>');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #0a1628;
      border-bottom: 3px solid #b8860b;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    h2 {
      color: #132040;
      margin-top: 25px;
      margin-bottom: 15px;
      font-size: 22px;
    }
    h3 {
      color: #334f87;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 8px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    .header h1 {
      border: none;
      margin-bottom: 5px;
    }
    .date {
      color: #666;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    strong {
      color: #0a1628;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p class="date">Généré le ${date}</p>
  </div>

  <div class="content">
    ${summaryHTML}
  </div>

  <div class="footer">
    <p>Document généré automatiquement par ORDO BTP</p>
  </div>
</body>
</html>
  `;
}

async function generatePDFFromHTML(html: string): Promise<Uint8Array> {
  const chromiumEndpoint = Deno.env.get("CHROMIUM_ENDPOINT");

  if (chromiumEndpoint) {
    const response = await fetch(chromiumEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF from Chromium service");
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  const encoder = new TextEncoder();
  return encoder.encode(html);
}
