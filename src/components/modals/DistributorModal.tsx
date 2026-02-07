import React, { useState } from 'react';
import { Store, DollarSign, Wrench, Save } from 'lucide-react';
import Modal from '../Modal';

interface IndustrialConfig {
  mdf: number;
  hardware: number;
}

interface DistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IndustrialConfig;
  onSave: (config: IndustrialConfig) => void;
}

export const DistributorModal: React.FC<DistributorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<IndustrialConfig>(config);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tabela de Preços" icon={Store}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} />
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">
              Preços Atuais (MDF Industrial)
            </span>
          </div>
          <p className="text-sm opacity-80 mt-2">
            Configure os valores base para cálculo automático de orçamentos
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-wood/20 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-wood rounded" />
                </div>
                <span className="font-bold text-foreground text-sm">MDF Carvalho 18mm</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">R$</span>
              <input
                type="number"
                value={localConfig.mdf}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, mdf: Number(e.target.value) })
                }
                className="flex-1 p-3 bg-muted border border-border rounded-xl text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted-foreground text-xs">/chapa</span>
            </div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <Wrench size={16} className="text-muted-foreground" />
                </div>
                <span className="font-bold text-foreground text-sm">Ferragem Standard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">R$</span>
              <input
                type="number"
                value={localConfig.hardware}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, hardware: Number(e.target.value) })
                }
                className="flex-1 p-3 bg-muted border border-border rounded-xl text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted-foreground text-xs">/unidade</span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center">
            Os valores serão aplicados automaticamente em todos os orçamentos futuros
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-industrial text-industrial-foreground py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
        >
          <Save size={18} /> Salvar Configuração
        </button>
      </div>
    </Modal>
  );
};

export default DistributorModal;
