import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Camera, Plus, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import LogoMarcenApp from '../components/Logo';
import ChatMessage from '../components/ChatMessage';
import Lightbox from '../components/Lightbox';
import ToolsDrawer from '../components/ToolsDrawer';
import ManifestoModal from '../components/modals/ManifestoModal';
import BentoModal from '../components/modals/BentoModal';
import EstelaModal from '../components/modals/EstelaModal';
import IdentityModal from '../components/modals/IdentityModal';
import GainsModal from '../components/modals/GainsModal';
import LogisticsModal from '../components/modals/LogisticsModal';
import DistributorModal from '../components/modals/DistributorModal';
import CNCExportModal from '../components/modals/CNCExportModal';
import MaterialsModal from '../components/modals/MaterialsModal';
import { IaraModule, FinanceEngine } from '../lib/iara';
import { useVoice } from '../hooks/useVoice';

interface Message {
  id: number;
  type: 'text' | 'status' | 'user-image' | 'master-card';
  from: 'user' | 'iara';
  text?: string;
  src?: string;
  render?: string;
  ref?: string;
}

interface Project {
  tipo: string;
  pecas: Array<{ nome: string; w: number; h: number; qtd: number }>;
  materiais: { estrutura: string; cor: string };
  valor_mercado: number;
  lucro_marceneiro: number;
  otimizacao: number;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'text',
      from: 'iara',
      text: 'Saudações, Mestre! OS v43 Ultimate Precision. Voz humana e renderização 8K ArchViz ativos. Desenvolvido por Evaldo.os e acelerado por LHS Business Group.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [industrialConfig, setIndustrialConfig] = useState({ mdf: 440, hardware: 38 });
  const [selectedMaterial, setSelectedMaterial] = useState('mdf_carvalho_malva');
  const [finance, setFinance] = useState<{ venda: number; lucro: number; custo: number; m2: string; pecas: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { speak, startListening, isListening } = useVoice();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleVoice = () => {
    const success = startListening((transcript) => setInputText(transcript));
    if (!success) {
      toast.error('Reconhecimento de voz não disponível.');
    }
  };

  const shareWhatsApp = () => {
    if (!project) return;
    const msg = `*Showroom MarcenApp*\n\nOlá! Confira o seu novo projeto fotorrealista:\n\n🏠 *Móvel:* ${project.tipo}\n🌳 *Acabamento:* ${project.materiais.cor}\n💰 *Valor Sugerido:* R$ ${project.valor_mercado.toLocaleString('pt-BR')}\n\nO que achou deste render master?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const downloadImage = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `MarcenApp_Showroom_${Date.now()}.png`;
    link.click();
    toast.success('Render guardado!');
  };

  const handlePipeline = async (imageSrc: string) => {
    setIsProcessing(true);
    setIsToolsOpen(false);
    const pid = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: pid, type: 'user-image', from: 'user', src: imageSrc },
      { id: pid + 1, type: 'status', from: 'iara', text: 'Sincronizando DNA Industrial...' },
    ]);

    try {
      const data = await IaraModule.analyzeEnvironment(imageSrc);
      setProject(data.project);
      const fin = FinanceEngine.calculate(data.project.pecas, industrialConfig);
      setFinance(fin);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pid + 1 ? { ...m, text: 'Consolidando Fotografia 8K...' } : m
        )
      );
      const render = await IaraModule.generateMasterRender(imageSrc, data.description);

      setMessages((prev) => prev.filter((m) => m.id !== pid + 1));
      if (render) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: 'master-card', from: 'iara', render, ref: imageSrc },
        ]);
        speak('Mestre, projeto finalizado com fidelidade técnica absoluta.');
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'text', from: 'iara', text: 'Falha na ligação industrial.' },
      ]);
      toast.error('Erro no processamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'text', from: 'user', text: inputText },
    ]);
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => {
        if (ev.target?.result) {
          handlePipeline(ev.target.result as string);
        }
      };
      r.readAsDataURL(f);
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-industrial font-sans sm:p-2">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <Lightbox
        imageSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDownload={downloadImage}
        onShare={shareWhatsApp}
        onApprove={() => {
          setSelectedImage(null);
          toast.success('Aprovado!');
        }}
      />

      <ManifestoModal
        isOpen={activeModal === 'manifesto'}
        onClose={() => setActiveModal(null)}
      />
      <BentoModal
        isOpen={activeModal === 'bento'}
        onClose={() => setActiveModal(null)}
        project={project}
        finance={finance}
      />
      <EstelaModal
        isOpen={activeModal === 'estela'}
        onClose={() => setActiveModal(null)}
        project={project}
        finance={finance}
      />
      <IdentityModal
        isOpen={activeModal === 'identidade'}
        onClose={() => setActiveModal(null)}
      />
      <GainsModal
        isOpen={activeModal === 'ganhos'}
        onClose={() => setActiveModal(null)}
      />
      <LogisticsModal
        isOpen={activeModal === 'logistica'}
        onClose={() => setActiveModal(null)}
      />
      <DistributorModal
        isOpen={activeModal === 'distribuidor'}
        onClose={() => setActiveModal(null)}
        config={industrialConfig}
        onSave={(config) => {
          setIndustrialConfig(config);
          toast.success('Tabela de preços atualizada!');
        }}
      />
      <CNCExportModal
        isOpen={activeModal === 'cnc'}
        onClose={() => setActiveModal(null)}
        project={project}
        onExport={() => toast.success('DNA exportado com sucesso!')}
      />
      <MaterialsModal
        isOpen={activeModal === 'materiais'}
        onClose={() => setActiveModal(null)}
        selectedMaterial={selectedMaterial}
        onSelect={(material) => {
          setSelectedMaterial(material.id);
          toast.success(`Material ${material.name} selecionado!`);
        }}
      />

      <div className="w-full max-w-[480px] h-screen sm:h-[880px] bg-background sm:rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl sm:border-[12px] border-industrial relative">
        {/* Notch */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-industrial rounded-b-3xl z-[100]" />

        {/* Header */}
        <header className="bg-industrial pt-8 sm:pt-12 pb-5 px-6 flex items-center justify-between text-industrial-foreground shadow-xl z-30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-industrial-muted flex items-center justify-center border border-border/10 shadow-inner overflow-hidden p-2">
              <LogoMarcenApp />
            </div>
            <div>
              <h1 className="font-black text-sm uppercase tracking-[0.1em] mb-1 leading-none">
                MARCEN<span className="text-primary">APP</span>
              </h1>
              <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.2em] uppercase opacity-90">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isProcessing ? 'bg-primary' : 'bg-emerald-400'
                  }`}
                />
                {isProcessing ? 'Surgical Sync' : 'Industrial Pro v43'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('manifesto')}
            className="p-3 bg-industrial-foreground/5 rounded-2xl hover:bg-industrial-foreground/10 text-primary active:scale-90 transition-all shadow-md"
          >
            <Landmark size={20} />
          </button>
        </header>

        {/* Messages */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted scrollbar-thin pb-24 z-10"
        >
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onImageClick={setSelectedImage}
              onBudgetClick={() => setActiveModal('estela')}
              onProductionClick={() => setActiveModal('bento')}
            />
          ))}
          <div className="py-12 text-center opacity-30">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-foreground">
              Desenvolvido por Evaldo.os
            </p>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-primary">
              Acelerado por LHS Business Group
            </p>
          </div>
        </main>

        {/* Tools Drawer */}
      <ToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        onGalleryClick={() => galleryInputRef.current?.click()}
        onBrandClick={() => setActiveModal('identidade')}
        onBentoClick={() => setActiveModal('bento')}
        onEstelaClick={() => setActiveModal('estela')}
        onGainsClick={() => setActiveModal('ganhos')}
        onLogisticsClick={() => setActiveModal('logistica')}
        onManifestoClick={() => setActiveModal('manifesto')}
        onDistributorClick={() => setActiveModal('distribuidor')}
        onCNCClick={() => setActiveModal('cnc')}
        onMaterialsClick={() => setActiveModal('materiais')}
      />

        {/* Footer Input */}
        <footer className="bg-card p-5 border-t border-border flex items-center gap-4 z-[100] shadow-2xl pb-10 sm:pb-5">
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`p-4 rounded-2xl transition-all border shadow-md active:scale-90 ${
              isToolsOpen
                ? 'bg-industrial text-industrial-foreground rotate-45 border-industrial shadow-lg'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            <Plus size={24} />
          </button>
          <div className="flex-1 bg-muted rounded-3xl flex items-center px-5 py-4 border border-border shadow-inner group transition-all focus-within:bg-card focus-within:border-primary">
            <input
              type="text"
              placeholder="Falar com a IARA..."
              className="w-full text-sm outline-none bg-transparent font-medium text-foreground placeholder:text-muted-foreground"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="flex items-center gap-4 ml-2 pl-3 border-l border-border">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="text-muted-foreground active:text-primary active:scale-90 transition-all"
              >
                <Camera size={22} />
              </button>
              <button
                onClick={handleVoice}
                className={`transition-all active:scale-90 ${
                  isListening ? 'text-destructive animate-pulse scale-125' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Mic size={22} />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-industrial border border-primary/20"
          >
            <Send size={24} />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Index;