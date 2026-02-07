import React from 'react';
import { Palette, Check } from 'lucide-react';
import Modal from '../Modal';

interface Material {
  id: string;
  name: string;
  color: string;
}

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMaterial: string;
  onSelect: (material: Material) => void;
}

const materials: Material[] = [
  { id: 'mdf_carvalho_malva', name: 'Carvalho Malva', color: '#C5A07E' },
  { id: 'mdf_grafite', name: 'Grafite Silk', color: '#4B4B4B' },
  { id: 'mdf_branco_tx', name: 'Branco TX', color: '#FAFAFA' },
  { id: 'mdf_louro_freijo', name: 'Louro Freijó', color: '#A67B5B' },
  { id: 'mdf_nogueira', name: 'Nogueira', color: '#5D4037' },
  { id: 'mdf_preto_tx', name: 'Preto TX', color: '#1C1C1C' },
];

export const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  selectedMaterial,
  onSelect,
}) => {
  const handleSelect = (material: Material) => {
    onSelect(material);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biblioteca de Materiais" icon={Palette}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-wood to-wood-dark p-6 rounded-3xl text-white">
          <h3 className="font-bold text-lg mb-2">Acabamentos MDF Premium</h3>
          <p className="text-sm opacity-80">
            Selecione o acabamento para aplicar nos renders fotorrealistas
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {materials.map((material) => {
            const isSelected = selectedMaterial === material.id;
            return (
              <button
                key={material.id}
                onClick={() => handleSelect(material)}
                className={`relative p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div
                  className="w-full h-16 rounded-2xl shadow-inner"
                  style={{ backgroundColor: material.color }}
                />
                <span className="text-xs font-bold uppercase tracking-tight text-foreground">
                  {material.name}
                </span>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-muted p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center">
            O material selecionado será aplicado automaticamente nos próximos renders
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialsModal;
