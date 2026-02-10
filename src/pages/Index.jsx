import React, { useState, useCallback } from 'react';
import { MarcenaProvider } from '../contexts/MarcenaContext';
import Workshop from '../components/Workshop';

const Index = () => {
  const [toastMsg, setToastMsg] = useState(null);

  const notify = useCallback((text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  return (
    <MarcenaProvider notifyProp={notify}>
      <Workshop />
      {toastMsg && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] bg-zinc-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-zinc-700 text-sm font-bold"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          {toastMsg}
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </MarcenaProvider>
  );
};

export default Index;
