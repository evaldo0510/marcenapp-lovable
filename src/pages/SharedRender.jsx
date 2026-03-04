import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, Download, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function SharedRender() {
  const [render, setRender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const token = window.location.pathname.split('/share/')[1];

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    supabase
      .from('renders')
      .select('*')
      .eq('share_token', token)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRender(data);
        else setNotFound(true);
        setLoading(false);
      });
  }, [token]);

  const downloadImage = async () => {
    if (!render) return;
    try {
      const res = await fetch(render.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `IARA_RENDER_${render.id.slice(0, 8)}.png`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 150);
    } catch {}
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center text-center px-8">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-black text-white mb-2">Render Não Encontrado</h1>
        <p className="text-white/40 text-xs">Este link de compartilhamento é inválido ou expirou.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 100 100" className="w-8 h-8">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
            <circle cx="50" cy="50" r="8" fill="#3b82f6" />
          </svg>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight">IARA <span className="text-blue-500">STUDIO</span></h1>
            <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.3em]">Visualização de Projeto</p>
          </div>
        </div>
        <button onClick={downloadImage} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">
          <Download size={14} /> Salvar
        </button>
      </header>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img src={render.image_url} alt="Render" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
      </div>

      {/* Feedback */}
      <div className="px-6 pb-6">
        {render.prompt && (
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-4 truncate">
            Descrição: {render.prompt}
          </p>
        )}
        {feedbackSent ? (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4">
            <CheckCircle size={16} className="text-emerald-500" />
            <p className="text-emerald-400 text-xs font-bold">Feedback enviado com sucesso!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/40">
              <MessageSquare size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Deixe seu feedback</span>
            </div>
            <div className="flex gap-3">
              <input
                value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Aprovar, solicitar ajustes..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={async () => {
                  if (!feedback.trim()) return;
                  const feedbackType = feedback.includes('✅') ? 'approved' : feedback.includes('🔄') ? 'revision' : 'comment';
                  await supabase.from('render_feedback').insert({
                    render_id: render.id,
                    feedback_text: feedback,
                    feedback_type: feedbackType,
                  });
                  await supabase.from('renders').update({ has_new_feedback: true }).eq('id', render.id);
                  setFeedbackSent(true);
                }}
                className="bg-blue-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Enviar
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setFeedback('✅ Projeto aprovado!'); }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
                <CheckCircle size={12} /> Aprovar
              </button>
              <button onClick={() => { setFeedback('🔄 Precisa de ajustes: '); }} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
                <MessageSquare size={12} /> Ajustes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
