import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GOOGLE_AI_KEY && !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Nenhuma API key configurada. Adicione GOOGLE_AI_KEY ou LOVABLE_API_KEY." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const useGoogle = !!GOOGLE_AI_KEY;
    const { action, imageBase64, description, prompt } = await req.json();

    if (action === "analyze") {
      return useGoogle
        ? await googleAnalyze(imageBase64, prompt, GOOGLE_AI_KEY!)
        : await lovableAnalyze(imageBase64, prompt, LOVABLE_API_KEY!);
    } else if (action === "render") {
      return useGoogle
        ? await googleRender(imageBase64, description, GOOGLE_AI_KEY!, LOVABLE_API_KEY)
        : await lovableRender(imageBase64, description, LOVABLE_API_KEY!);
    } else if (action === "chat") {
      return useGoogle
        ? await googleChat(prompt, imageBase64, GOOGLE_AI_KEY!)
        : await lovableChat(prompt, imageBase64, LOVABLE_API_KEY!);
    } else if (action === "status") {
      return new Response(JSON.stringify({
        provider: useGoogle ? "google" : "lovable",
        hasGoogleKey: !!GOOGLE_AI_KEY,
        hasLovableKey: !!LOVABLE_API_KEY,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    console.error("Pipeline error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ==========================================
// GOOGLE AI DIRECT (Free Tier)
// ==========================================

async function googleAnalyze(imageBase64: string | undefined, prompt: string | undefined, apiKey: string) {
  const model = "gemini-2.5-flash";
  const parts: any[] = [
    { text: `LEITURA ABSOLUTA: Extraia 100% dos textos, materiais e cotas anotados. Transcreva fielmente. Retorne JSON: {"description":"...","project":{"tipo":"...","pecas":[{"nome":"...","w":0,"h":0,"qtd":0}],"materiais":{"estrutura":"...","cor":"..."},"valor_mercado":0,"lucro_marceneiro":0,"otimizacao":0}}. ${prompt || "Analise o rascunho."}` }
  ];
  if (imageBase64) {
    const b64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { mimeType: "image/png", data: b64 } });
  }

  const resp = await fetch(`${GOOGLE_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Google analyze error:", resp.status, errText);
    return handleGoogleError(resp.status, errText);
  }

  const result = await resp.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No analysis response");
  const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  return new Response(JSON.stringify(parsed), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function googleRender(imageBase64: string, description: string, apiKey: string, fallbackApiKey?: string | null) {
  const model = "gemini-2.0-flash-preview-image-generation";
  const systemPrompt = `### TASK: PIXEL-PERFECT SHOWROOM PHOTOGRAPH.
GEOMETRY SLAVERY: Sketch lines are absolute edges. Convert pencil to sharp luxury finishes.
Materials: PBR Wood grain [CARVALHO MALVA] and [MATTE WHITE].
Lighting: Professional ArchViz Soft-box, Global Illumination. 8K Photo Quality.
CONTEXT: ${description}`;

  const parts: any[] = [{ text: systemPrompt }];
  if (imageBase64) {
    const b64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { mimeType: "image/png", data: b64 } });
  }

  const resp = await fetch(`${GOOGLE_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Google render error:", resp.status, errText);

    if (resp.status === 404 && fallbackApiKey) {
      console.warn("Google image model unavailable, falling back to Lovable AI gateway render.");
      return await lovableRender(imageBase64, description, fallbackApiKey);
    }

    return handleGoogleError(resp.status, errText);
  }

  const result = await resp.json();
  const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  const imageData = imagePart?.inlineData?.data || null;

  if (!imageData && fallbackApiKey) {
    console.warn("Google render returned no image, falling back to Lovable AI gateway render.");
    return await lovableRender(imageBase64, description, fallbackApiKey);
  }

  return new Response(JSON.stringify({
    render: imageData ? `data:image/png;base64,${imageData}` : null,
    error: imageData ? null : "Render failed"
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function googleChat(prompt: string, imageBase64: string | null, apiKey: string) {
  const model = "gemini-2.5-flash";
  const parts: any[] = [
    { text: `És a IARA, inteligência do MarcenApp. Analisa rascunhos técnicos com precisão industrial. Responde de forma curta em português brasileiro.\n\nUtilizador: ${prompt}` }
  ];
  if (imageBase64) {
    const b64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { mimeType: "image/png", data: b64 } });
  }

  const resp = await fetch(`${GOOGLE_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Google chat error:", resp.status, errText);
    return handleGoogleError(resp.status, errText);
  }

  const result = await resp.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Erro operacional.";
  return new Response(JSON.stringify({ text }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function handleGoogleError(status: number, _errText: string) {
  if (status === 429) {
    return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde 60s." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (status === 401 || status === 403) {
    return new Response(JSON.stringify({ error: "API Key inválida ou expirada. Verifique nas configurações." }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: `Erro Google AI: ${status}` }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ==========================================
// LOVABLE AI GATEWAY (Fallback)
// ==========================================

async function lovableAnalyze(imageBase64: string | undefined, prompt: string | undefined, apiKey: string) {
  const systemPrompt = `Você é IARA, o cérebro industrial do MarcenApp.
REGRAS:
1. Identifique Ripados, Portas de Correr e Detalhes Técnicos exatamente como desenhados.
2. Retorne JSON puro sem markdown.
3. Se receber apenas texto sem imagem, analise o pedido e gere um projeto baseado na descrição.
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

  const userContent: any[] = [{ type: "text", text: prompt || "Analise o rascunho técnico em JSON." }];
  if (imageBase64) {
    userContent.push({ type: "image_url", image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` } });
  }

  const resp = await fetch(LOVABLE_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("AI gateway error:", resp.status, errText);
    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    throw new Error("AI gateway error: " + resp.status);
  }

  const result = await resp.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error("No analysis response");
  const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function lovableRender(imageBase64: string, description: string, apiKey: string) {
  const prompt = `### TASK: PIXEL-PERFECT SHOWROOM PHOTOGRAPH.
GEOMETRY SLAVERY: Sketch lines are absolute edges. Convert pencil to sharp luxury finishes.
Materials: PBR Wood grain [CARVALHO MALVA] and [MATTE WHITE].
Lighting: Professional ArchViz Soft-box, Global Illumination. 8K Photo Quality.
CONTEXT: ${description}`;

  const userContent: any[] = [{ type: "text", text: prompt }];
  if (imageBase64) {
    userContent.push({ type: "image_url", image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` } });
  }

  const resp = await fetch(LOVABLE_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash-image", messages: [{ role: "user", content: userContent }], modalities: ["image", "text"] }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Render error:", resp.status, errText);
    return new Response(JSON.stringify({ render: null, error: "Render failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const result = await resp.json();
  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
  return new Response(JSON.stringify({ render: imageUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function lovableChat(prompt: string, imageBase64: string | null, apiKey: string) {
  const content: any[] = [{ type: "text", text: prompt }];
  if (imageBase64) {
    content.push({ type: "image_url", image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}` } });
  }

  const resp = await fetch(LOVABLE_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "És a IARA, inteligência do MarcenApp. Analisa rascunhos técnicos com precisão industrial. Responde de forma curta em português brasileiro." },
        { role: "user", content },
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Chat error:", resp.status, errText);
    if (resp.status === 429 || resp.status === 402) {
      return new Response(JSON.stringify({ text: "Limite atingido. Tente novamente em breve." }), { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ text: "Erro no processamento." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const result = await resp.json();
  const text = result.choices?.[0]?.message?.content || "Erro operacional.";
  return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
