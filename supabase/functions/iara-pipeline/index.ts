import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, imageBase64, description, prompt } = await req.json();

    if (action === "analyze") {
      return await handleAnalyze(imageBase64, LOVABLE_API_KEY);
    } else if (action === "render") {
      return await handleRender(imageBase64, description, LOVABLE_API_KEY);
    } else if (action === "chat") {
      return await handleChat(prompt, imageBase64, LOVABLE_API_KEY);
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleAnalyze(imageBase64: string, apiKey: string) {
  const systemPrompt = `Você é IARA, o cérebro do MarcenApp.
REGRAS: 
1. Identifique Ripados, Portas de Correr e Detalhes Técnicos exatamente como desenhados.
2. Retorne JSON puro sem markdown.
{
  "description": "archviz photography, studio lighting, luxury textures, carvalho malva wood grain, 8k, photorealistic",
  "project": {
    "tipo": "Móvel Master Industrial",
    "pecas": [{"nome": "Lateral", "w": 2400, "h": 600, "qtd": 2}],
    "materiais": {"estrutura": "MDF 18mm", "cor": "Carvalho Malva"},
    "valor_mercado": 9500.00,
    "lucro_marceneiro": 2850.00,
    "otimizacao": 96.8
  }
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: "Analise o rascunho técnico em JSON." },
        {
          type: "image_url",
          image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` },
        },
      ],
    },
  ];

  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  const result = await resp.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error("No analysis response");

  const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanJson);

  return new Response(JSON.stringify(parsed), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleRender(
  imageBase64: string,
  description: string,
  apiKey: string
) {
  const prompt = `### TASK: PIXEL-PERFECT SHOWROOM PHOTOGRAPH.
GEOMETRY SLAVERY: Sketch lines are absolute edges. Convert pencil to sharp luxury finishes.
Materials: PBR Wood grain [CARVALHO MALVA] and [MATTE WHITE].
Lighting: Professional ArchViz Soft-box, Global Illumination. 8K Photo Quality.
CONTEXT: ${description}`;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` },
        },
      ],
    },
  ];

  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages,
      modalities: ["image", "text"],
    }),
  });

  const result = await resp.json();
  const imageUrl =
    result.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

  return new Response(JSON.stringify({ render: imageUrl }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleChat(
  prompt: string,
  imageBase64: string | null,
  apiKey: string
) {
  const content: any[] = [{ type: "text", text: prompt }];
  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` },
    });
  }

  const messages = [
    {
      role: "system",
      content:
        "És a IARA, inteligência do MarcenApp por Evaldo.OS. Analisa rascunhos técnicos com precisão industrial. Responde de forma curta em português.",
    },
    { role: "user", content },
  ];

  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
    }),
  });

  const result = await resp.json();
  const text =
    result.choices?.[0]?.message?.content || "Erro operacional.";

  return new Response(JSON.stringify({ text }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
