import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { 
  X, Mic, Trash2 as Trash, Hammer, ChevronRight, Camera, Send, 
  UserPlus, Contact, Terminal, Coins, Loader2, PlusCircle, FolderOpen, 
  AlertCircle, CloudOff, Cloud, StoreIcon, MessageSquare
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/genai";

// --- 1. CONFIGURAÇÃO FIREBASE (Automática ou Manual) ---
const getFirebaseConfig = () => {
  try {
    // Tenta pegar do HTML (window) ou das variáveis de ambiente do Vite
    const config = (window as any).__firebase_config || {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    return config && config.apiKey ? config : null;
  } catch (e) { return null; }
};

const firebaseConfig = getFirebaseConfig();
let app, auth, db;

if (firebaseConfig && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (getApps().length) {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- 2. SERVIÇO GEMINI (IARA AI) ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY;

const YaraAI = {
  async analyze(imageBase64: string | null, prompt: string) {
    if (!GEMINI_API_KEY) return "⚠️ Mestre, preciso da minha chave VITE_GEMINI_API_KEY para pensar.";
    try {
      // Simulação de chamada (Substitua pela chamada real do SDK se tiver a chave)
      // Como não tenho a chave aqui, vou simular uma resposta inteligente
      return `[IARA]: Analisei seu pedido "${prompt}". Se isso fosse uma imagem real, eu diria as medidas e o material. (Configure a API Key para ver a mágica!)`;
    } catch (error) {
      console.error("Erro Iara:", error);
      return "Erro ao processar inteligência.";
    }
  }
};

// --- 3. COMPONENTES DO SISTEMA ---

// Botão Genérico Bonito
const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }: any) => {
  const base = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg";
  const styles = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/20",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
    danger: "bg-red-900/50 text-red-200 hover:bg-red-900",
    ghost: "bg-transparent text-slate-400 hover:text-white"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// Tela de Login Anônimo
const LoginScreen = ({ onLogin }: any) => {
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setLoading(true);
    if (auth) {
      try {
        const userCred = await signInAnonymously(auth);
        onLogin(userCred.user);
      } catch (e) { alert("Erro ao entrar: " + e.message); }
    } else {
      // Modo Offline (Sem Firebase)
      onLogin({ uid: 'offline-user', isAnonymous: true });
    }
    setLoading(false);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Hammer size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-black text-white mb-2">MARCENA<span className="text-orange-500">PP</span></h1>
      <p className="text-slate-400 mb-8 max-w-xs">O Sistema Operacional da sua Marcenaria. Inteligência Artificial + Gestão.</p>
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Terminal />}
        {loading ? "Iniciando Sistema..." : "ACESSAR OFICINA"}
      </Button>
    </div>
  );
};

// --- 4. APLICAÇÃO PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('dashboard'); // dashboard, client, project
  const [clients, setClients] = useState<any[]>([]);
  const [activeClient, setActiveClient] = useState<any>(null);

  // Efeito para carregar dados (Simulação se não tiver Firebase)
  useEffect(() => {
    if (!user) return;
    if (db) {
      // Conectar no Firebase Real
      const unsub = onSnapshot(collection(db, 'clients'), (snap) => {
        setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    } else {
      // Dados de Exemplo (Modo Offline)
      setClients([
        { id: '1', name: 'Dona Maria', phone: '1199999999', address: 'Rua das Flores' },
        { id: '2', name: 'Sr. João', phone: '1188888888', address: 'Av. Paulista' }
      ]);
    }
  }, [user]);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* CABEÇALHO */}
      <header className="bg-slate-900 text-white p-4 pb-8 rounded-b-[2rem] shadow-xl shrink-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xs font-bold text-orange-500 tracking-widest uppercase">MarcenaPP v2.0</h2>
            <h1 className="text-xl font-black">Olá, Mestre! 👋</h1>
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <UserPlus size={18} className="text-slate-400" />
          </div>
        </div>
        
        {/* Status Financeiro Rápido */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Lucro Previsto</p>
            <p className="text-2xl font-bold text-green-400">R$ 14.250</p>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold text-right">Projetos</p>
            <p className="text-2xl font-bold text-white text-right">04</p>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-y-auto p-4 -mt-6 pt-8 space-y-4">
        
        {/* Lista de Clientes */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Contact size={18} className="text-orange-500" /> Clientes Ativos
            </h3>
            <button className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">NOVO</button>
          </div>
          
          <div className="space-y-2">
            {clients.map(c => (
              <div key={c.id} onClick={() => setActiveClient(c)} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center active:bg-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-700">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
            {clients.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Nenhum cliente ainda.</p>}
          </div>
        </div>

        {/* IARA VISION (Placeholder) */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={100} /></div>
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2 relative z-10">
            <Camera className="text-purple-400" /> Iara Vision
          </h3>
          <p className="text-xs text-slate-400 mb-4 relative z-10 max-w-[70%]">Tire foto de um móvel e eu gero o plano de corte e orçamento.</p>
          <Button variant="secondary" className="w-full text-sm relative z-10 border border-slate-700">
            <Camera size={16} /> ABRIR CÂMERA
          </Button>
        </div>

      </main>

      {/* MENU INFERIOR FLUTUANTE */}
      <nav className="bg-white border-t border-slate-200 p-3 pb-6 flex justify-around items-center shrink-0">
        <button className="flex flex-col items-center gap-1 text-orange-600">
          <StoreIcon size={24} />
          <span className="text-[10px] font-bold">Oficina</span>
        </button>
        <button className="bg-orange-600 text-white p-4 rounded-full shadow-lg -mt-8 border-4 border-slate-50 flex items-center justify-center">
          <PlusCircle size={28} />
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold">Iara</span>
        </button>
      </nav>

    </div>
  );
}
