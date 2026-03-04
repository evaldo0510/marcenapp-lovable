import React from 'react';
import { CheckCheck } from 'lucide-react';

export default function ChatBubble({ msg, onInspect }) {
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
            />
          </div>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{textContent}</p>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px] opacity-50">{msg.time || 'Agora'}</span>
          {isUser && <CheckCheck size={12} className="opacity-50" />}
        </div>
      </div>
    </div>
  );
}
