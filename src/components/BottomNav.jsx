import React, { memo } from 'react';
import { Hammer, Users, Wallet, ClipboardList } from 'lucide-react';
import HexLogo from './HexLogo';

const sideTabs = [
  { id: 'patio', label: 'Pátio', icon: Hammer },
  { id: 'clientes', label: 'Clientes', icon: Users },
  null, // center placeholder
  { id: 'orcar', label: 'Orçar', icon: Wallet },
  { id: 'diario', label: 'Diário', icon: ClipboardList },
];

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl border-t border-white/[0.06]" />

      <div className="relative flex items-end justify-around px-4 pt-1 pb-1">
        {sideTabs.map((tab, i) => {
          if (!tab) {
            return (
              <button
                key="iara-center"
                onClick={() => onTabChange('iara')}
                className="relative -mt-7 flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
              >
                <HexLogo size={56} active={activeTab === 'iara'} />
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${
                  activeTab === 'iara' ? 'text-[#007AFF]' : 'text-white/25'
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
              className={`flex flex-col items-center gap-1 py-2.5 px-3 transition-all active:scale-90 ${
                isActive ? 'scale-105' : ''
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors ${
                  isActive ? 'text-[#007AFF]' : 'text-white/25'
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[9px] font-bold tracking-wider transition-colors ${
                isActive ? 'text-[#007AFF]' : 'text-white/25'
              }`}>
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
