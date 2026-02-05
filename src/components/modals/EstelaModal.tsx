import React from 'react';
import { DollarSign, TrendingUp, Coins, FileText, Send } from 'lucide-react';
import Modal from '../Modal';

interface Project {
  tipo: string;
  pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
  materiais: { estrutura: string; cor: string };
  valor_mercado: number;
  lucro_marceneiro: number;
  otimizacao: number;
}

interface EstelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const EstelaModal: React.FC<EstelaModalProps> = ({ isOpen, onClose, project }) => {
  const valorMercado = project?.valor_mercado || 9500;
  const lucro = project?.lucro_marceneiro || 2850;
  const custoMaterial = valorMercado * 0.35;
  const custoMaoDeObra = valorMercado * 0.35;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ESTELA - Orçamento" icon={DollarSign}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Valor de Mercado</span>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <div className="text-4xl font-black">
            R$ {valorMercado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs opacity-80 mt-2">{project?.tipo || 'Móvel Industrial Master'}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Coins size={14} /> Composição de Custos
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
              <span className="text-sm text-muted-foreground">Material</span>
              <span className="font-bold text-foreground">
                R$ {custoMaterial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
              <span className="text-sm text-muted-foreground">Mão de Obra</span>
              <span className="font-bold text-foreground">
                R$ {custoMaoDeObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <span className="text-sm font-bold text-primary">Lucro Líquido</span>
              <span className="font-black text-primary text-lg">
                R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground">Margem de Lucro</span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${(lucro / valorMercado) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-primary">
              {((lucro / valorMercado) * 100).toFixed(1)}%
            </span>
            <span>50%</span>
          </div>
        </div>

        <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-industrial">
          <Send size={18} /> Enviar Proposta ao Cliente
        </button>
      </div>
    </Modal>
  );
};

export default EstelaModal;
