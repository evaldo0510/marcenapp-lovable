import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setSuccess('Verifique seu email para confirmar o cadastro.');
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : err.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <div className="mb-10 text-center">
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto mb-4">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#007AFF" strokeWidth="2" opacity="0.3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#007AFF" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="8" fill="#007AFF" />
        </svg>
        <h1 className="text-xl font-black text-[#1a2a3a] tracking-tight">
          IARA <span className="text-[#007AFF]">STUDIO</span>
        </h1>
        <p className="text-[#1a2a3a]/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
          Sistema Industrial Inteligente
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#007AFF]/30" />
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm text-white outline-none focus:border-[#007AFF] transition-colors"
          />
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Senha" minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-4 text-sm text-white outline-none focus:border-[#007AFF] transition-colors"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs font-bold">
            {success}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl border-b-4 border-[#0055CC] disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>{isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight size={16} /></>
          )}
        </button>

        <button
          type="button" onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
          className="w-full text-white/40 text-xs font-bold py-2 hover:text-[#007AFF] transition-colors"
        >
          {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>

        {isLogin && (
          <button
            type="button"
            onClick={async () => {
              if (!email) { setError('Informe seu email primeiro.'); return; }
              setLoading(true); setError(null);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`
                });
                if (error) throw error;
                setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
              } catch (err) {
                setError(err.message || 'Erro ao enviar email de recuperação.');
              } finally { setLoading(false); }
            }}
            className="w-full text-white/30 text-[10px] font-bold py-1 hover:text-[#007AFF] transition-colors"
          >
            Esqueceu a senha?
          </button>
        )}
      </form>
    </div>
  );
}
