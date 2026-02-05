// IARA Module - Industrial AI Analysis and Rendering
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "gemini-2.5-flash-image-preview";

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

export const IaraModule = {
  analyzeEnvironment: async (imageBase64: string, apiKey: string): Promise<AnalysisResult> => {
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${apiKey}`,
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
    apiKey: string
  ): Promise<string | null> => {
    const prompt = `### TASK: PIXEL-PERFECT SHOWROOM PHOTOGRAPH. 
    GEOMETRY SLAVERY: Sketch lines are absolute edges. Convert pencil to sharp luxury finishes.
    Materials: PBR Wood grain [CARVALHO MALVA] and [MATTE WHITE].
    Lighting: Professional ArchViz Soft-box, Global Illumination. 8K Photo Quality.
    CONTEXT: ${analysisDescription}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IMAGE}:generateContent?key=${apiKey}`,
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
};

export default IaraModule;
