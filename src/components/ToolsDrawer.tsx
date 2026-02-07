import React from 'react';
import { X, Image as LucideImage, Palette, Scissors, DollarSign, BarChart3, Truck, Flag, Store, Cloud, Box } from 'lucide-react';
import LogoMarcenApp from './Logo';

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGalleryClick: () => void;
  onBrandClick: () => void;
  onBentoClick: () => void;
  onEstelaClick: () => void;
  onGainsClick: () => void;
  onLogisticsClick: () => void;
  onManifestoClick: () => void;
  onDistributorClick: () => void;
  onCNCClick: () => void;
  onMaterialsClick: () => void;
}

const tools = [
  { icon: LucideImage, label: 'GALERIA', variant: 'secondary' as const, key: 'gallery' },
  { icon: Store, label: 'PREÇOS', variant: 'primary' as const, key: 'distributor' },
  { icon: Cloud, label: 'CNC', variant: 'secondary' as const, key: 'cnc' },
  { icon: Box, label: 'MDF', variant: 'primary' as const, key: 'materials' },
];

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({
  isOpen,
  onClose,
  onGalleryClick,
  onBrandClick,
  onBentoClick,
  onEstelaClick,
  onGainsClick,
  onLogisticsClick,
  onManifestoClick,
  onDistributorClick,
  onCNCClick,
  onMaterialsClick,
}) => {
  if (!isOpen) return null;

  const handleToolClick = (key: string) => {
    switch (key) {
      case 'gallery':
        onGalleryClick();
        break;
      case 'distributor':
        onDistributorClick();
        break;
      case 'cnc':
        onCNCClick();
        break;
      case 'materials':
        onMaterialsClick();
        break;
    }
  };

  return (
    <div className="absolute bottom-24 left-0 right-0 px-4 z-[500] animate-slide-up">
      <div className="bg-card/98 backdrop-blur-3xl rounded-4xl p-8 shadow-2xl border border-border text-foreground">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 font-mono">
            <LogoMarcenApp size={20} /> Master OS v43
          </h2>
          <button
            onClick={onClose}
            className="bg-muted p-2.5 rounded-full active:scale-90 transition-transform shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-10 text-center font-mono">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isPrimary = tool.variant === 'primary';
            return (
              <button
                key={tool.key}
                onClick={() => handleToolClick(tool.key)}
                className="flex flex-col items-center gap-3 active:translate-y-1 transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm active:scale-90 transition-transform ${
                    isPrimary
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-foreground border-border'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{tool.label}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-6 text-[10px]">
          <button
            onClick={onBentoClick}
            className="bg-muted py-4 rounded-2xl border border-border font-black text-foreground active:scale-95 uppercase flex items-center justify-center gap-2 transition-transform"
          >
            <Scissors size={16} /> Produção
          </button>
          <button
            onClick={onEstelaClick}
            className="bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase active:scale-95 shadow-industrial flex items-center justify-center gap-2 transition-transform"
          >
            <DollarSign size={16} /> Orçamento
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 text-[10px]">
          <button
            onClick={onGainsClick}
            className="bg-industrial text-industrial-foreground py-4 rounded-2xl font-black uppercase active:scale-95 shadow-lg flex items-center justify-center gap-2 transition-transform"
          >
            <BarChart3 size={16} /> Ganhos
          </button>
          <button
            onClick={onLogisticsClick}
            className="bg-muted py-4 rounded-2xl border border-border font-black text-muted-foreground active:scale-95 uppercase flex items-center justify-center gap-2 transition-transform"
          >
            <Truck size={16} /> Logística
          </button>
          <button
            onClick={onManifestoClick}
            className="bg-muted py-4 rounded-2xl border border-border font-black text-muted-foreground active:scale-95 uppercase flex items-center justify-center gap-2 transition-transform"
          >
            <Flag size={16} /> Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsDrawer;
