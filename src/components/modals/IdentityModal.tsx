import React from 'react';
import { Palette, Edit3, Check } from 'lucide-react';
import Modal from '../Modal';
import LogoMarcenApp from '../Logo';

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  { name: 'Carvalho Malva', color: '#8B6F47' },
  { name: 'Nogueira Escuro', color: '#5D4037' },
  { name: 'Branco Premium', color: '#FAFAFA' },
  { name: 'Preto Industrial', color: '#1C1C1C' },
  { name: 'Amêndoa Natural', color: '#D4B896' },
  { name: 'Cinza Grafite', color: '#424242' },
];

export const IdentityModal: React.FC<IdentityModalProps> = ({ isOpen, onClose }) => {
  const [selectedColor, setSelectedColor] = React.useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identidade Visual" icon={Palette}>
      <div className="space-y-6">
        <div className="text-center">
          <LogoMarcenApp size={64} className="mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Sua Marca</h3>
          <p className="text-sm text-muted-foreground">Personalize a identidade do seu ateliê</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Nome do Ateliê
          </h4>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Marcenaria Artesanal"
              className="w-full p-4 pr-12 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Edit3 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Paleta de Cores
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {colorOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(i)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  selectedColor === i
                    ? 'border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div
                  className="w-full h-12 rounded-xl mb-2"
                  style={{ backgroundColor: option.color }}
                />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {option.name}
                </span>
                {selectedColor === i && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Contato WhatsApp
          </h4>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            className="w-full p-4 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase text-sm active:scale-95 transition-transform shadow-industrial">
          Salvar Identidade
        </button>
      </div>
    </Modal>
  );
};

export default IdentityModal;
