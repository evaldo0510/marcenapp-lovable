import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';

const MarcenaContext = createContext(null);

export const useMarcena = () => {
  const ctx = useContext(MarcenaContext);
  if (!ctx) throw new Error('useMarcena must be used within MarcenaProvider');
  return ctx;
};

export function MarcenaProvider({ children, notifyProp }) {
  const [state, setState] = useState({
    activeModal: null,
    activeProjectId: null,
    projects: [],
    projectDNA: {
      pecas: [],
      materiais: [],
      pricing: { total: 0, material: 0 },
      cutPlan: { efficiency: 0 },
    },
    industrialRates: { mdf: 440, markup: 2.2, taxRate: 0.12 },
    messages: [],
    loadingAI: false,
    aiStep: 'Pronto',
    isReady: false,
  });

  const updateState = useCallback((key, val) => {
    setState(prev => ({ ...prev, [key]: val }));
  }, []);

  const notify = useCallback((msg) => {
    if (typeof notifyProp === 'function') notifyProp(String(msg));
  }, [notifyProp]);

  const financeiro = useMemo(() => {
    const todasPecas = [...(state.projectDNA.pecas || [])];
    let areaTotal = 0;
    todasPecas.forEach(p => {
      areaTotal += ((p.w || 0) * (p.h || 0) * (p.q || 1)) / 1000000;
    });
    const mdfBase = state.industrialRates.mdf / 5;
    const custoProd = areaTotal * mdfBase * 1.35;
    const vendaBase = custoProd * state.industrialRates.markup;
    const impostos = vendaBase * state.industrialRates.taxRate;
    return {
      area: areaTotal,
      custo: custoProd,
      venda: vendaBase + impostos,
      lucro: vendaBase - custoProd,
      chapas: Math.ceil(areaTotal / 4.3),
    };
  }, [state.projectDNA, state.industrialRates]);

  return (
    <MarcenaContext.Provider value={{ ...state, updateState, notify, financeiro }}>
      {children}
    </MarcenaContext.Provider>
  );
}
