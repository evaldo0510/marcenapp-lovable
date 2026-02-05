import React from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Target, Award } from 'lucide-react';
import Modal from '../Modal';

interface GainsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const monthlyData = [
  { mes: 'Jan', valor: 12500, meta: 15000 },
  { mes: 'Fev', valor: 18200, meta: 15000 },
  { mes: 'Mar', valor: 21000, meta: 18000 },
  { mes: 'Abr', valor: 16800, meta: 18000 },
  { mes: 'Mai', valor: 24500, meta: 20000 },
  { mes: 'Jun', valor: 28900, meta: 25000 },
];

export const GainsModal: React.FC<GainsModalProps> = ({ isOpen, onClose }) => {
  const totalGanhos = monthlyData.reduce((acc, m) => acc + m.valor, 0);
  const mediamensal = totalGanhos / monthlyData.length;
  const melhorMes = monthlyData.reduce((prev, curr) => prev.valor > curr.valor ? prev : curr);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ganhos Master" icon={BarChart3}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Acumulado</span>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <div className="text-4xl font-black">
            R$ {totalGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs opacity-80 mt-2">Últimos 6 meses</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-muted-foreground">Média Mensal</span>
            </div>
            <p className="text-xl font-black text-foreground">
              R$ {mediamensal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-primary">Melhor Mês</span>
            </div>
            <p className="text-xl font-black text-primary">{melhorMes.mes}</p>
            <p className="text-xs text-muted-foreground">
              R$ {melhorMes.valor.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Target size={14} /> Desempenho por Mês
          </h4>
          <div className="space-y-2">
            {monthlyData.map((item, i) => {
              const percentual = (item.valor / item.meta) * 100;
              const atingiuMeta = percentual >= 100;
              return (
                <div key={i} className="bg-card p-3 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-foreground">{item.mes}</span>
                    <span className={`text-sm font-bold ${atingiuMeta ? 'text-primary' : 'text-muted-foreground'}`}>
                      R$ {item.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${atingiuMeta ? 'bg-primary' : 'bg-muted-foreground'}`}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>Meta: R$ {item.meta.toLocaleString('pt-BR')}</span>
                    <span className={atingiuMeta ? 'text-primary font-bold' : ''}>
                      {percentual.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="w-full bg-industrial text-industrial-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
          <DollarSign size={18} /> Exportar Relatório
        </button>
      </div>
    </Modal>
  );
};

export default GainsModal;
