import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { X, Trash2, Download, Loader2, Image as ImageIcon, Share2, Link2, Check } from 'lucide-react';

export default function Gallery({ onClose }) {
  const [renders, setRenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadRenders();
  }, []);

  const loadRenders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('renders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRenders(data);
    setLoading(false);
  };

  const [copiedId, setCopiedId] = useState(null);

  const deleteRender = async (id) => {
    await supabase.from('renders').delete().eq('id', id);
    setRenders(renders.filter(r => r.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const shareRender = async (render) => {
    let token = render.share_token;
    if (!token) {
      token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      await supabase.from('renders').update({ share_token: token }).eq('id', render.id);
      setRenders(renders.map(r => r.id === render.id ? { ...r, share_token: token } : r));
    }
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(render.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = async (imageUrl, id) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IARA_RENDER_${id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 150);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617]/98 backdrop-blur-2xl flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <ImageIcon size={20} className="text-blue-500" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Galeria de Renders</h2>
        </div>
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : renders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
            <ImageIcon size={48} />
            <p className="text-sm font-bold">Nenhum render salvo ainda.</p>
            <p className="text-xs">Materialize sua primeira obra no Studio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {renders.map(r => (
              <div key={r.id} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/5 aspect-video cursor-pointer" onClick={() => setSelectedImage(r)}>
                <img src={r.image_url} alt="Render" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-[9px] text-white/60 font-bold truncate flex-1">{r.prompt || 'Sem descrição'}</p>
                   <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); shareRender(r); }} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-emerald-500 transition-colors">
                      {copiedId === r.id ? <Check size={12} /> : <Share2 size={12} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); downloadImage(r.image_url, r.id); }} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                      <Download size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRender(r.id); }} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
                  <span className="text-[8px] text-white/50 font-bold">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage.image_url} alt="Render" className="max-w-full max-h-full object-contain rounded-2xl" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            <button onClick={(e) => { e.stopPropagation(); downloadImage(selectedImage.image_url, selectedImage.id); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">
              <Download size={14} /> Salvar 8K
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteRender(selectedImage.id); }} className="bg-red-600/20 text-red-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all border border-red-500/20">
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
