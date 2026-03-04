import React from 'react';
import { Hammer, Users, Sparkles, Wallet, ClipboardList } from 'lucide-react';

const tabs = [
  { id: 'patio', label: 'Pátio', icon: Hammer },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'iara', label: 'Iara', icon: Sparkles, isCenter: true },
  { id: 'orcar', label: 'Orçar', icon: Wallet },
  { id: 'diario', label: 'Diário', icon: ClipboardList },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-[#020617]/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 pt-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -mt-6 flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 shadow-blue-600/40' 
                    : 'bg-white/10 border border-white/10'
                }`}>
                  <Icon size={22} className={isActive ? 'text-white' : 'text-white/50'} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isActive ? 'text-blue-400' : 'text-white/30'
                }`}>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 active:scale-95 transition-all"
            >
              <Icon size={18} className={isActive ? 'text-blue-400' : 'text-white/30'} />
              <span className={`text-[9px] font-bold ${
                isActive ? 'text-blue-400' : 'text-white/30'
              }`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
