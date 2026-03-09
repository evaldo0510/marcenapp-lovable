import React, { memo } from 'react';
import { Hammer, ClipboardList, Wallet, Layers } from 'lucide-react';
import HexLogo from './HexLogo';

const sideTabs = [
  { id: 'patio', label: 'Pátio', icon: Hammer },
  { id: 'diario', label: 'Diário', icon: ClipboardList },
  null, // center placeholder
  { id: 'orcar', label: 'Orçar', icon: Wallet },
  { id: 'planta', label: 'Planta', icon: Layers },
];

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl border-t border-[#007AFF]/10 shadow-[0_-4px_20px_rgba(0,122,255,0.06)]" />

      <div className="relative flex items-end justify-around px-4 pt-1 pb-1">
        {sideTabs.map((tab, i) => {
          if (!tab) {
            return (
              <button
                key="iara-center"
                onClick={() => onTabChange('iara')}
                className="relative -mt-8 active:scale-95 transition-transform"
              >
                <HexLogo size={56} active={activeTab === 'iara'} />
                <span className={`block text-center text-[8px] font-black uppercase tracking-[0.2em] transition-colors mt-0.5 ${
                  activeTab === 'iara' ? 'text-[#007AFF]' : 'text-[#1a2a3a]/30'
                }`}>
                  Iara
                </span>
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 w-12 py-2.5 transition-all active:scale-90 ${
                isActive ? 'text-[#007AFF] scale-110' : 'text-[#54656F] opacity-40'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[9px] font-bold tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(BottomNav);
