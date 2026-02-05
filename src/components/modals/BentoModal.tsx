import React from 'react';
import { Scissors, Box, Ruler, Layers, FileText, Download } from 'lucide-react';
import Modal from '../Modal';

interface Project {
  tipo: string;
  pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
  materiais: { estrutura: string; cor: string };
  valor_mercado: number;
  lucro_marceneiro: number;
  otimizacao: number;
}

interface BentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const BentoModal: React.FC<BentoModalProps> = ({ isOpen, onClose, project }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="BENTO - Produção" icon={Scissors}>
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Box size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{project?.tipo || 'Móvel Industrial'}</h3>
              <p className="text-xs text-muted-foreground">Plano de Corte Otimizado</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers size={14} /> Lista de Peças
          </h4>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-3 bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Peça</span>
              <span>Largura</span>
              <span>Altura</span>
              <span>Qtd</span>
            </div>
            {(project?.pecas || [
              { nome: 'Lateral Esquerda', w: 2400, h: 600, qtd: 1 },
              { nome: 'Lateral Direita', w: 2400, h: 600, qtd: 1 },
              { nome: 'Base', w: 1200, h: 600, qtd: 1 },
              { nome: 'Prateleira', w: 1160, h: 580, qtd: 3 },
              { nome: 'Tampo', w: 1200, h: 600, qtd: 1 },
            ]).map((peca, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 p-3 text-sm border-t border-border"
              >
                <span className="font-medium text-foreground">{peca.nome}</span>
                <span className="text-muted-foreground font-mono">{peca.w}mm</span>
                <span className="text-muted-foreground font-mono">{peca.h}mm</span>
                <span className="text-primary font-bold">{peca.qtd}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Ruler size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-muted-foreground">Material</span>
            </div>
            <p className="font-bold text-foreground">{project?.materiais?.estrutura || 'MDF 18mm'}</p>
            <p className="text-sm text-muted-foreground">{project?.materiais?.cor || 'Carvalho Malva'}</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-primary">Otimização</span>
            </div>
            <p className="text-2xl font-black text-primary">{project?.otimizacao || 96.8}%</p>
            <p className="text-xs text-muted-foreground">Aproveitamento</p>
          </div>
        </div>

        <button className="w-full bg-industrial text-industrial-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
          <Download size={18} /> Exportar Plano de Corte
        </button>
      </div>
    </Modal>
  );
};

export default BentoModal;
