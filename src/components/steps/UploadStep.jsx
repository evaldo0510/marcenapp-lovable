import React, { memo } from 'react';
import { Camera, Send, Mic, MicOff, VolumeX, Pencil, Eye } from 'lucide-react';
import ChatBubble from '../ChatBubble';
import HexLogo from '../HexLogo';

function UploadStep({
  messages, chatLoading, scrollRef, chatInput, setChatInput,
  sendChat, triggerUpload, voice, generatedImage, openInspector,
  generateRender, setMaskEditorData
}) {
  return (
    <div className="h-full flex flex-col pb-10">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-4 custom-scrollbar">
        {messages.length === 0 ? (
...
      {/* Input bar */}
      <div className="px-4 pb-5 pt-3 border-t border-[#007AFF]/10 bg-white">
        {generatedImage && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            <button
              onClick={() => openInspector(generatedImage)}
              className="shrink-0 px-4 py-2 bg-[#007AFF] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95"
            >
              <Pencil size={12} /> Editar Render
            </button>
            <button
              onClick={() => generateRender('multi')}
              className="shrink-0 px-4 py-2 bg-[#1a2a3a]/5 text-[#1a2a3a]/60 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 border border-[#1a2a3a]/10"
            >
              <Eye size={12} /> Multi-Vista
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={triggerUpload} className="p-2.5 text-[#007AFF]/40 hover:text-[#007AFF] active:scale-90 transition-all">
            <Camera size={20} />
          </button>

          {voice.isSpeaking && (
            <button onClick={voice.stopSpeaking} className="p-2 text-[#007AFF] animate-pulse active:scale-90">
              <VolumeX size={18} />
            </button>
          )}

          <div className={`flex-1 rounded-full px-4 py-3 flex items-center transition-all border ${
            voice.isListening
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-[#007AFF]/5 border-[#007AFF]/15 focus-within:border-[#007AFF]/40'
          }`}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={voice.isListening ? "🎤 Ouvindo..." : "Pergunte à IARA..."}
              className="flex-1 bg-transparent text-[#1a2a3a] text-sm outline-none placeholder:text-[#1a2a3a]/30"
            />
          </div>

          {chatInput.trim() ? (
            <button
              onClick={sendChat}
              className="w-12 h-12 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-lg shadow-[#00A884]/20 active:scale-90 transition-all"
            >
              <Send size={16} />
            </button>
          ) : (
            <button
              onClick={voice.isListening ? () => { voice.stopListening(); if (voice.transcript) setTimeout(sendChat, 300); } : voice.startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${
                voice.isListening ? 'bg-red-500 animate-pulse shadow-red-500/20' : 'bg-[#00A884] shadow-[#00A884]/20'
              } text-white`}
            >
              {voice.isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(UploadStep);
