import React, { useState } from 'react';
import { X, Send, Crop, Type, Pencil, Sticker, Wand2 } from 'lucide-react';

export default function UploadPreview({ photo, onCancel, onConfirm, onDirectRender }) {
  const [caption, setCaption] = useState('');

  return (
    <div className="fixed inset-0 z-[400] bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button onClick={onCancel} className="p-2 text-white/60 active:scale-90">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3">
          <button className="p-2 text-white/40"><Crop size={18} /></button>
          <button className="p-2 text-white/40"><Type size={18} /></button>
          <button className="p-2 text-white/40"><Pencil size={18} /></button>
          <button className="p-2 text-white/40"><Sticker size={18} /></button>
        </div>
      </header>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img src={photo} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl" />
      </div>

      {/* Caption + Send */}
      <div className="px-4 pb-6 pt-2 space-y-3">
        {/* Direct render button */}
        {onDirectRender && (
          <button
            onClick={() => onDirectRender(caption)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#007AFF] to-[#0066DD] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl border-b-4 border-[#0055CC]"
          >
            <Wand2 size={18} /> GERAR PROJETO DIRETO
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 flex items-center">
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm(caption)}
              placeholder="Ou descreva e desenhe no rascunho..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
          </div>
          <button
            onClick={() => onConfirm(caption)}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center shadow-xl active:scale-90 transition-all border border-white/10"
            title="Ir para rascunho"
          >
            <Pencil size={16} />
          </button>
        </div>
        <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-widest">
          Gere direto da foto ou desenhe no rascunho
        </p>
      </div>
    </div>
  );
}
