import React, { memo } from 'react';
import { CheckCheck, MapPin, Hammer, Maximize2 } from 'lucide-react';

function ChatBubble({ msg, onInspect, onMaskEdit, onMaterialChange }) {
  const isUser = msg.from === 'user';
  const textContent = typeof msg.text === 'object' ? JSON.stringify(msg.text) : String(msg.text || '');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 px-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-md' 
          : 'bg-white/10 text-white/90 rounded-bl-md border border-white/5'
      }`}>
        {msg.type === 'image' && msg.src && (
          <div 
            onClick={() => onInspect?.(msg.src)} 
            className="mb-2 -mx-1 -mt-1 rounded-xl overflow-hidden cursor-pointer group"
          >
            <img 
              src={msg.src} 
              alt="Render" 
              className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{textContent}</p>
        
        {msg.type === 'image' && msg.src && !isUser && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button 
              onClick={() => onMaskEdit?.(msg.src)} 
              className="shrink-0 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-blue-500/20 active:scale-95 transition-all"
            >
              <MapPin size={10} /> Ponto Exato
            </button>
            <button 
              onClick={() => onMaterialChange?.(msg.src)} 
              className="shrink-0 bg-white/5 text-white/50 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-white/5 active:scale-95 transition-all"
            >
              <Hammer size={10} /> Material
            </button>
            <button 
              onClick={() => onInspect?.(msg.src)} 
              className="shrink-0 bg-white/5 text-white/50 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-white/5 active:scale-95 transition-all"
            >
              <Maximize2 size={10} /> Ampliar
            </button>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px] opacity-50">{msg.time || 'Agora'}</span>
          {isUser && <CheckCheck size={12} className="opacity-50" />}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatBubble);
