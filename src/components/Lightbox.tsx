import React from 'react';
import { X, Download, MessageSquare, CheckCircle2 } from 'lucide-react';
import LogoMarcenApp from './Logo';

interface LightboxProps {
  imageSrc: string | null;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  onApprove: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  imageSrc,
  onClose,
  onDownload,
  onShare,
  onApprove,
}) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-industrial flex flex-col animate-fade-in">
      <header className="p-5 flex justify-between items-center text-industrial-foreground border-b border-border/10 bg-industrial shadow-xl">
        <div className="flex items-center gap-3">
          <LogoMarcenApp size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Showroom v43</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-industrial-foreground/5 rounded-full active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={imageSrc}
          className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-border/10"
          alt="Render"
        />
      </div>
      <footer className="p-6 bg-industrial grid grid-cols-3 gap-3 pb-10">
        <button
          onClick={onDownload}
          className="flex flex-col items-center justify-center gap-2 bg-industrial-foreground/5 p-4 rounded-2xl border border-border/10 active:scale-95 transition-transform"
        >
          <Download size={22} className="text-muted-foreground" />
          <span className="text-[8px] font-black text-muted-foreground uppercase">Baixar</span>
        </button>
        <button
          onClick={onShare}
          className="flex flex-col items-center justify-center gap-2 bg-primary/10 p-4 rounded-2xl border border-primary/20 active:scale-95 transition-transform"
        >
          <MessageSquare size={22} className="text-primary" />
          <span className="text-[8px] font-black text-primary uppercase">WhatsApp</span>
        </button>
        <button
          onClick={onApprove}
          className="flex flex-col items-center justify-center gap-2 bg-primary p-4 rounded-2xl active:scale-95 shadow-industrial transition-transform"
        >
          <CheckCircle2 size={22} className="text-primary-foreground" />
          <span className="text-[8px] font-black text-primary-foreground uppercase">Aprovar</span>
        </button>
      </footer>
    </div>
  );
};

export default Lightbox;
