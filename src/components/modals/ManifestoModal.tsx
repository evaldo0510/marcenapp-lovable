import React from 'react';
import { Landmark } from 'lucide-react';
import Modal from '../Modal';
import LogoMarcenApp from '../Logo';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManifestoModal: React.FC<ManifestoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manifesto MarcenApp" icon={Landmark}>
      <div className="space-y-6">
        <div className="text-center">
          <LogoMarcenApp size={80} className="mx-auto mb-2" />
          <h3 className="text-2xl font-black uppercase text-foreground tracking-tighter leading-none">
            A Constituição Industrial
          </h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
            Honra • Precisão • Prosperidade
          </p>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p className="border-l-4 border-primary pl-4 text-sm leading-relaxed">
            Desenvolvido por <strong className="text-foreground">Evaldo.os</strong> e acelerado pelo{' '}
            <strong className="text-foreground">LHS Business Group</strong>. A nossa missão é a verdade
            técnica e o lucro master.
          </p>
          <div className="bg-muted p-5 rounded-3xl text-muted-foreground leading-relaxed italic text-xs">
            "No MarcenApp, o rascunho é a lei. Iara materializa a alma da madeira, Bento automatiza a
            precisão e Estela blinda o faturamento."
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="bg-muted p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-primary">IA</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
              Análise
            </div>
          </div>
          <div className="bg-muted p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-primary">8K</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
              Render
            </div>
          </div>
          <div className="bg-muted p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-primary">PRO</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
              Orçamento
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManifestoModal;
