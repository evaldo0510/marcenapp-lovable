import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { X, Key, Zap, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react';

export default function SettingsPanel({ onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'status' }
      });
      if (!error && data) setStatus(data);
    } catch (e) {
      console.error('Status check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0f1e] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Settings size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Configurações</h2>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Painel de Controle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status do Motor */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-blue-400" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Motor Ativo</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : status ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Provider</span>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    status.provider === 'google'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {status.provider === 'google' ? 'Google AI (Gratuito)' : 'Lovable AI'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Google AI Key</span>
                  <div className="flex items-center gap-2">
                    {status.hasGoogleKey ? (
                      <><CheckCircle size={12} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-bold">Configurada</span></>
                    ) : (
                      <><AlertCircle size={12} className="text-white/20" /><span className="text-[10px] text-white/20 font-bold">Não configurada</span></>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Lovable AI Key</span>
                  <div className="flex items-center gap-2">
                    {status.hasLovableKey ? (
                      <><CheckCircle size={12} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-bold">Configurada</span></>
                    ) : (
                      <><AlertCircle size={12} className="text-white/20" /><span className="text-[10px] text-white/20 font-bold">Não configurada</span></>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/30">Erro ao verificar status</p>
            )}
          </div>

          {/* Info Card - Google AI */}
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-blue-400" />
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">API Google AI Studio</p>
            </div>
            <p className="text-[11px] text-blue-200/60 leading-relaxed">
              A chave gratuita do Google AI Studio permite gerar renders e análises sem custos.
              Para adicionar ou alterar a chave, peça ao assistente no chat.
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={12} /> Obter chave gratuita
            </a>
          </div>

          {/* Models Info */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Modelos Utilizados</p>
            <div className="space-y-2">
              {[
                { name: 'Análise Técnica', model: 'Gemini 2.5 Flash', color: 'text-amber-400' },
                { name: 'Renderização 8K', model: 'Gemini Flash Image', color: 'text-blue-400' },
                { name: 'Chat Industrial', model: 'Gemini 2.5 Flash', color: 'text-emerald-400' },
              ].map(m => (
                <div key={m.name} className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] text-white/50">{m.name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${m.color}`}>{m.model}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
