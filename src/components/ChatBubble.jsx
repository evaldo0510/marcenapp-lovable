import React, { memo } from 'react';
import { CheckCheck, MapPin, Hammer, Maximize2 } from 'lucide-react';

function ChatBubble({ msg, onInspect, onMaskEdit, onMaterialChange }) {
  const isUser = msg.from === 'user';
  const textContent = typeof msg.text === 'object' ? JSON.stringify(msg.text) : String(msg.text || '');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2.5 px-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#0055CC] flex items-center justify-center mr-2 mt-1 shrink-0 shadow-md">
          <span className="text-[10px] font-black text-white">M</span>
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
        isUser 
          ? 'bg-[#DCF8C6] text-[#111B21] rounded-br-sm' 
          : 'bg-white/[0.06] text-white/90 rounded-bl-sm border border-white/[0.06]'
      }`}>
        {msg.type === 'image' && msg.src && (
          <div 
            onClick={() => onInspect?.(msg.src)} 
            className="mb-2 -mx-1 -mt-1 rounded-xl overflow-hidden cursor-pointer group relative border border-black/5"
          >
            <img 
              src={msg.src} 
              alt="Render" 
              className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
              <span className="text-white text-[8px] font-black uppercase tracking-widest">Inspeccionar</span>
            </div>
          </div>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{textContent}</p>
        
        {msg.type === 'image' && msg.src && !isUser && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
            <button 
              onClick={() => onMaskEdit?.(msg.src)} 
              className="shrink-0 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-[#007AFF]/20 active:scale-95 transition-all"
            >
              <MapPin size={10} /> Ponto Exato
            </button>
            <button 
              onClick={() => onMaterialChange?.(msg.src)} 
              className="shrink-0 bg-white/[0.04] text-white/40 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-white/[0.06] active:scale-95 transition-all"
            >
              <Hammer size={10} /> Material
            </button>
            <button 
              onClick={() => onInspect?.(msg.src)} 
              className="shrink-0 bg-white/[0.04] text-white/40 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-white/[0.06] active:scale-95 transition-all"
            >
              <Maximize2 size={10} /> Ampliar
            </button>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[9px] ${isUser ? 'text-[#111B21]/40' : 'opacity-40'}`}>{msg.time || 'Sinc.'}</span>
          {isUser && <CheckCheck size={12} className="text-[#007AFF]/60" />}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatBubble);
