import React from 'react';
import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  icon: Icon 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-industrial/95 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div className="bg-card w-full max-w-xl rounded-t-4xl sm:rounded-4xl overflow-hidden flex flex-col h-[90vh] sm:h-auto shadow-2xl border border-border">
        <div className="p-5 bg-industrial text-industrial-foreground flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={20} className="animate-pulse text-primary" />}
            <h2 className="font-bold uppercase tracking-widest text-xs">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="bg-industrial-foreground/20 p-2 rounded-full active:scale-90 transition-transform"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin bg-muted text-foreground pb-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
