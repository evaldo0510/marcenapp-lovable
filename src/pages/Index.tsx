import React from 'react';
import GeradorDeLink from '../components/GeradorDeLink';
import Render3D from '../components/Render3D';
import { Hammer, Ruler, BrainCircuit } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* CABEÇALHO */}
      <header className="bg-slate-900 text-white p-6 rounded-b-[3rem] shadow-xl relative z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">
              MARCENA<span className="text-orange-500">PP</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">SISTEMA INTEGRADO DE MARCENARIA</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Lucro Projetado</p>
            <h2 className="text-2xl font-bold">R$ 12.540,00</h2>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-8">
        
        {/* ÁREA 1: VISUALIZAÇÃO 3D (Iara Vision) */}
        <section className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
          <Render3D />
        </section>

        {/* ÁREA 2: FERRAMENTAS RÁPIDAS */}
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Hammer size={20} /></div>
            <span className="text-[10px] font-bold text-slate-600">PROJETOS</span>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Ruler size={20} /></div>
            <span className="text-[10px] font-bold text-slate-600">PLANOS DE CORTE</span>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600"><BrainCircuit size={20} /></div>
            <span className="text-[10px] font-bold text-slate-600">I.A. IARA</span>
          </button>
        </div>

        {/* ÁREA 3: GERADOR DE LINK (Vendas) */}
        <section>
          <GeradorDeLink />
        </section>

      </main>
    </div>
  );
};

export default Index;
