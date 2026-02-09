// src/pages/Index.jsx
import React from 'react';
import GeradorDeLink from '../components/GeradorDeLink'; // <--- Importe aqui

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ... seu cabeçalho ... */}
      
      <div className="p-4">
        {/* Aqui está o formulário novo 👇 */}
        <GeradorDeLink />
      </div>

      {/* ... o resto do seu dashboard ... */}
    </div>
  );
};

export default Index;
