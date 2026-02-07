import React from 'react';
import { Cloud, Cpu, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import Modal from '../Modal';

interface Project {
  tipo: string;
  pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
  materiais: { estrutura: string; cor: string };
  valor_mercado: number;
  lucro_marceneiro: number;
  otimizacao: number;
}

interface CNCExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onExport: () => void;
}

export const CNCExportModal: React.FC<CNCExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onExport,
}) => {
  const pecas = project?.pecas || [];
  const totalPecas = pecas.reduce((acc, p) => acc + p.qtd, 0);

  const handleExport = () => {
    onExport();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Corte Cloud - CNC" icon={Cloud}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <Cpu size={32} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Exportar para Usinagem</h3>
              <p className="text-sm opacity-80">
                Usinagem de {totalPecas} peças técnicas preparadas
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FileSpreadsheet size={14} /> Resumo do DNA
          </h4>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Componente</span>
              <span>Dimensões</span>
              <span className="text-right">Qtd</span>
            </div>
            {pecas.length > 0 ? (
              pecas.map((peca, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-2 p-3 text-sm border-t border-border"
                >
                  <span className="font-medium text-foreground">{peca.nome}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {peca.w} x {peca.h}
                  </span>
                  <span className="text-primary font-bold text-right">{peca.qtd}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Nenhuma peça processada ainda
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-foreground">{pecas.length}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">
              Tipos de Peça
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl text-center border border-primary/20">
            <p className="text-2xl font-black text-primary">{totalPecas}</p>
            <p className="text-[10px] font-bold uppercase text-primary">Total Unidades</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={pecas.length === 0}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-industrial disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Gerar Arquivo CNC
          </button>

          <button
            onClick={handleExport}
            disabled={pecas.length === 0}
            className="w-full bg-muted text-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} /> Solicitar Orçamento Corte
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CNCExportModal;
