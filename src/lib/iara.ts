// IARA Module - Industrial AI via Lovable Cloud Edge Functions
import { supabase } from '@/integrations/supabase/client';

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

const callEdgeFunction = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('iara-pipeline', {
    body,
  });
  if (error) throw new Error(error.message || 'Edge function error');
  return data;
};

export const IaraModule = {
  analyzeEnvironment: async (imageBase64: string): Promise<AnalysisResult> => {
    const data = await callEdgeFunction({
      action: 'analyze',
      imageBase64,
    });
    return data as AnalysisResult;
  },

  generateMasterRender: async (
    imageBase64: string,
    analysisDescription: string
  ): Promise<string | null> => {
    const data = await callEdgeFunction({
      action: 'render',
      imageBase64,
      description: analysisDescription,
    });
    return (data as { render: string | null }).render;
  },

  callAI: async (prompt: string, imageBase64?: string): Promise<string> => {
    try {
      const data = await callEdgeFunction({
        action: 'chat',
        prompt,
        imageBase64: imageBase64 || null,
      });
      return (data as { text: string }).text;
    } catch {
      return 'Sistema offline.';
    }
  },
};

export default IaraModule;
