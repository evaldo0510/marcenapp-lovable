import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { MessageSquare, X } from 'lucide-react';

export default function FeedbackNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel('feedback-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'render_feedback' },
        async (payload) => {
          const fb = payload.new;
          setNotification({
            id: fb.id,
            client: fb.client_name || 'Cliente',
            text: fb.feedback_text,
            type: fb.feedback_type,
          });
          // Auto-dismiss after 6s
          setTimeout(() => setNotification(null), 6000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[700] animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="bg-emerald-600/95 backdrop-blur-xl text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-900/40 flex items-start gap-3 border border-emerald-400/20">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <MessageSquare size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Novo Feedback</p>
          <p className="text-sm font-bold mt-0.5">{notification.client}</p>
          <p className="text-xs opacity-80 mt-1 truncate">{notification.text}</p>
        </div>
        <button onClick={() => setNotification(null)} className="p-1 opacity-60 hover:opacity-100 shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
