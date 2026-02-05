import React from 'react';
import { Truck, MapPin, Clock, Package, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import Modal from '../Modal';

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const deliveries = [
  { id: 1, cliente: 'João Silva', endereco: 'Rua das Flores, 123', status: 'entregue', data: '02/02/2026', tipo: 'Armário Cozinha' },
  { id: 2, cliente: 'Maria Santos', endereco: 'Av. Brasil, 456', status: 'transito', data: '05/02/2026', tipo: 'Guarda-Roupa' },
  { id: 3, cliente: 'Pedro Costa', endereco: 'Rua Nova, 789', status: 'agendado', data: '08/02/2026', tipo: 'Estante Sala' },
  { id: 4, cliente: 'Ana Oliveira', endereco: 'Praça Central, 10', status: 'agendado', data: '10/02/2026', tipo: 'Rack TV' },
];

const statusConfig = {
  entregue: { label: 'Entregue', color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle2 },
  transito: { label: 'Em Trânsito', color: 'text-accent', bg: 'bg-accent/10', icon: Truck },
  agendado: { label: 'Agendado', color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock },
};

export const LogisticsModal: React.FC<LogisticsModalProps> = ({ isOpen, onClose }) => {
  const entregues = deliveries.filter(d => d.status === 'entregue').length;
  const emTransito = deliveries.filter(d => d.status === 'transito').length;
  const agendados = deliveries.filter(d => d.status === 'agendado').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Logística & Entregas" icon={Truck}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 p-4 rounded-2xl text-center border border-primary/20">
            <CheckCircle2 size={20} className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-black text-primary">{entregues}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Entregues</p>
          </div>
          <div className="bg-accent/10 p-4 rounded-2xl text-center border border-accent/20">
            <Truck size={20} className="text-accent mx-auto mb-2" />
            <p className="text-2xl font-black text-accent">{emTransito}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Em Trânsito</p>
          </div>
          <div className="bg-muted p-4 rounded-2xl text-center border border-border">
            <Clock size={20} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{agendados}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Agendados</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Package size={14} /> Entregas Recentes
          </h4>
          <div className="space-y-2">
            {deliveries.map((delivery) => {
              const config = statusConfig[delivery.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              return (
                <div
                  key={delivery.id}
                  className="bg-card p-4 rounded-2xl border border-border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-bold text-foreground">{delivery.cliente}</h5>
                      <p className="text-xs text-muted-foreground">{delivery.tipo}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg}`}>
                      <StatusIcon size={12} className={config.color} />
                      <span className={`text-[10px] font-bold uppercase ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{delivery.endereco}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{delivery.data}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={18} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Próxima Entrega</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Maria Santos</strong> - Guarda-Roupa
          </p>
          <p className="text-xs text-muted-foreground">Av. Brasil, 456 • 05/02/2026</p>
        </div>

        <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-industrial">
          <MapPin size={18} /> Abrir Mapa de Rotas
        </button>
      </div>
    </Modal>
  );
};

export default LogisticsModal;
