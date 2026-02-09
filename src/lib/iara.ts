// IARA Module - Industrial AI Analysis and Rendering
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "gemini-2.5-flash-image-preview";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";
const API_KEY = "AIzaSyBOYDjSgF9GWjzHv00-oiR4k4oZr9L5_Rc";

interface AnalysisResult {
  description: string;
  project: {
    tipo: string;
    pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
    materiais: { estrutura: string; cor: string };
    valor_mercado: number;
    lucro_marceneiro: number;
    otimizacao: number;
  };
}

interface FinanceResult {
  venda: number;
  lucro: number;
  custo: number;
  m2: string;
  pecas: number;
}

// Retry with exponential backoff for rate limits
const fetchWithBackoff = async (url: string, options: RequestInit, maxRetries = 5): Promise<Response> => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500) return response;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
    }
    await new Promise(res => setTimeout(res, delay));
    delay *= 2;
  }
  throw new Error("Dissonância de Rede.");
};

// PCM to WAV converter for TTS
const pcmToWav = (pcmBase64: string, sampleRate = 24000): Blob | null => {
  try {
    const binaryString = atob(pcmBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);
    const writeString = (o: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, bytes.length, true);
    new Uint8Array(buffer).set(bytes, 44);
    return new Blob([buffer], { type: 'audio/wav' });
  } catch {
    return null;
  }
};

export const FinanceEngine = {
  calculate: (
    pecas: Array<{ nome: string; w: number; h: number; qtd: number }>,
    rates: { mdf: number; hardware: number } = { mdf: 440, hardware: 38 }
  ): FinanceResult => {
    if (!pecas || pecas.length === 0) return { venda: 0, lucro: 0, custo: 0, m2: '0.00', pecas: 0 };
    const m2 = pecas.reduce((acc, p) => acc + ((p.w * p.h) / 1000000) * p.qtd, 0);
    const custoProd = (Math.ceil(m2 / 5) * rates.mdf) + (pecas.length * rates.hardware) + (m2 * 650);
    const venda = custoProd * 1.65;
    return {
      venda,
      lucro: venda - custoProd,
      custo: custoProd,
      m2: m2.toFixed(2),
      pecas: pecas.length,
    };
  },
};

export const IaraModule = {
  getApiKey: () => API_KEY,

  analyzeEnvironment: async (imageBase64: string, apiKey?: string): Promise<AnalysisResult> => {
    const key = apiKey || API_KEY;
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

    try {
      const response = await fetchWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: 'Analise o rascunho técnico em JSON.' },
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: imageBase64.split(',')[1],
                    },
                  },
                ],
              },
            ],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      const result = await response.json();
      if (!result.candidates?.[0]) throw new Error('Sem resposta da API');
      const rawText = result.candidates[0].content.parts[0].text;
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      throw new Error('Erro na análise industrial.');
    }
  },

  generateMasterRender: async (
    imageBase64: string,
    analysisDescription: string,
    apiKey?: string
  ): Promise<string | null> => {
    const key = apiKey || API_KEY;
    const prompt = `### TASK: PIXEL-PERFECT SHOWROOM PHOTOGRAPH. 
    GEOMETRY SLAVERY: Sketch lines are absolute edges. Convert pencil to sharp luxury finishes.
    Materials: PBR Wood grain [CARVALHO MALVA] and [MATTE WHITE].
    Lighting: Professional ArchViz Soft-box, Global Illumination. 8K Photo Quality.
    CONTEXT: ${analysisDescription}`;

    try {
      const response = await fetchWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IMAGE}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: imageBase64.split(',')[1],
                    },
                  },
                ],
              },
            ],
            generationConfig: { responseModalities: ['IMAGE'], temperature: 0.01 },
          }),
        }
      );

      const result = await response.json();
      const base64Data = result.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData
      )?.inlineData?.data;
      return base64Data ? `data:image/png;base64,${base64Data}` : null;
    } catch (err) {
      throw new Error('Erro no render 8K.');
    }
  },

  speakWithTTS: async (text: string): Promise<void> => {
    if (!text || !API_KEY) return;
    const cleanText = text.replace(/\{.*?\}/gs, '').substring(0, 500);
    try {
      const resp = await fetchWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: cleanText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          }),
        }
      );
      const result = await resp.json();
      const pcm = result.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData
      )?.inlineData;
      if (pcm) {
        const rate = parseInt(pcm.mimeType?.split('rate=')[1]) || 24000;
        const wav = pcmToWav(pcm.data, rate);
        if (wav) {
          const audio = new Audio(URL.createObjectURL(wav));
          audio.play();
        }
      }
    } catch (e) {
      console.error('TTS Fail', e);
    }
  },

  callAI: async (prompt: string, imageBase64?: string): Promise<string> => {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: 'image/png', data: imageBase64 } });
    }
    try {
      const resp = await fetchWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            systemInstruction: {
              parts: [
                {
                  text: 'És a IARA, inteligência do MarcenApp por Evaldo.OS. Analisa rascunhos técnicos com precisão industrial. Responde de forma curta em português.',
                },
              ],
            },
          }),
        }
      );
      const result = await resp.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro operacional.';
    } catch {
      return 'Sistema offline.';
    }
  },
};

export default IaraModule;
