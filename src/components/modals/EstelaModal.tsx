import React from 'react';
import { DollarSign, TrendingUp, Coins, FileText, Send, Package, Ruler } from 'lucide-react';
import Modal from '../Modal';

interface Project {
  tipo: string;
  pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
  materiais: { estrutura: string; cor: string };
  valor_mercado: number;
  lucro_marceneiro: number;
  otimizacao: number;
}

interface FinanceData {
  venda: number;
  lucro: number;
  custo: number;
  m2: string;
  pecas: number;
}

interface EstelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  finance?: FinanceData | null;
}

export const EstelaModal: React.FC<EstelaModalProps> = ({ isOpen, onClose, project, finance }) => {
  const venda = finance?.venda || project?.valor_mercado || 0;
  const custo = finance?.custo || venda * 0.6;
  const lucro = finance?.lucro || project?.lucro_marceneiro || venda - custo;
  const m2 = finance?.m2 || '0.00';
  const totalPecas = finance?.pecas || project?.pecas?.length || 0;
  const margemPercent = venda > 0 ? ((lucro / venda) * 100) : 0;

  const shareWhatsApp = () => {
    const msg = `*Orçamento MarcenApp*\n\n📐 *Projeto:* ${project?.tipo || 'Móvel Industrial'}\n🌳 *Material:* ${project?.materiais?.cor || 'Carvalho Malva'}\n💰 *Valor:* R$ ${venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📏 *Área:* ${m2} m²\n🔧 *Peças:* ${totalPecas}\n\n_Orçamento gerado pelo MarcenApp_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ESTELA - Orçamento" icon={DollarSign}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Preço Final Sugerido</span>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <div className="text-4xl font-black">
            R$ {venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm opacity-80 mt-1 font-bold">
            Lucro: R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-60 mt-1">{project?.tipo || 'Móvel Industrial Master'}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Coins size={14} /> Composição de Custos
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Material / Produção</span>
              </div>
              <span className="font-bold text-foreground">
                R$ {custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Área Processada</span>
              </div>
              <span className="font-bold text-foreground">{m2} m²</span>
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
              style={{ width: `${Math.min(margemPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-primary">{margemPercent.toFixed(1)}%</span>
            <span>50%</span>
          </div>
        </div>

        <button
          onClick={shareWhatsApp}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-industrial"
        >
          <Send size={18} /> Enviar Proposta via WhatsApp
        </button>
      </div>
    </Modal>
  );
};

export default EstelaModal;
