import React from 'react';
import { CheckCheck, RotateCcw, ShieldCheck, Maximize2, DollarSign, Scissors } from 'lucide-react';

interface Message {
  id: number;
  type: 'text' | 'status' | 'user-image' | 'master-card';
  from: 'user' | 'iara';
  text?: string;
  src?: string;
  render?: string;
  ref?: string;
}

interface ChatMessageProps {
  message: Message;
  onImageClick?: (src: string) => void;
  onBudgetClick?: () => void;
  onProductionClick?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onImageClick,
  onBudgetClick,
  onProductionClick,
}) => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (message.type === 'text') {
    const isUser = message.from === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 animate-slide-up`}>
        <div
          className={`max-w-[85%] p-4 rounded-3xl shadow-card text-sm leading-relaxed font-medium ${
            isUser
              ? 'bg-industrial text-industrial-foreground rounded-tr-none border border-border/10'
              : 'bg-card border border-border rounded-tl-none text-card-foreground'
          }`}
        >
          {message.text}
          <div className="flex justify-end mt-1 text-[9px] opacity-40 font-mono italic">
            {time}
            {isUser && (
              <CheckCheck size={14} className="text-primary ml-1.5 animate-fade-in" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'status') {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-industrial text-industrial-foreground px-5 py-2.5 rounded-full border border-border/10 flex items-center gap-3 shadow-xl animate-pulse">
          <RotateCcw size={14} className="animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{message.text}</span>
        </div>
      </div>
    );
  }

  if (message.type === 'user-image' && message.src) {
    return (
      <div className="flex justify-end mb-2 animate-slide-up">
        <div className="max-w-[78%] bg-card p-1 rounded-3xl shadow-xl border-4 border-card ring-1 ring-border transition-transform hover:scale-[1.02]">
          <img src={message.src} className="w-full h-auto rounded-2xl" alt="Referência" />
        </div>
      </div>
    );
  }

  if (message.type === 'master-card' && message.render) {
    return (
      <div className="space-y-4 animate-slide-up">
        <div className="bg-card rounded-4xl overflow-hidden shadow-2xl border border-border">
          <div className="bg-industrial px-6 py-4 flex justify-between items-center text-industrial-foreground font-mono shadow-lg border-b border-border/10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Render Fidelidade 8K
              </span>
            </div>
          </div>
          <div
            className="relative aspect-square bg-industrial flex items-center justify-center overflow-hidden border-b border-border shadow-inner cursor-pointer group"
            onClick={() => onImageClick?.(message.render!)}
          >
            <img
              src={message.render}
              className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105"
              alt="Showroom"
            />
            <div className="absolute inset-0 bg-industrial/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-card/95 p-4 rounded-full text-foreground shadow-2xl">
                <Maximize2 size={24} />
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3 bg-muted border-t border-border">
            <button
              onClick={onBudgetClick}
              className="flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-bold uppercase active:scale-95 shadow-industrial transition-transform font-mono"
            >
              <DollarSign size={16} /> Orçamento
            </button>
            <button
              onClick={onProductionClick}
              className="flex items-center justify-center gap-3 py-4 bg-industrial text-industrial-foreground rounded-2xl text-[10px] font-bold uppercase active:scale-95 shadow-lg transition-transform font-mono"
            >
              <Scissors size={16} /> Produção
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage;
