import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Lock, Loader2, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center px-8">
        <CheckCircle size={48} className="text-emerald-500 mb-6" />
        <h1 className="text-xl font-black text-white mb-2">Senha Redefinida!</h1>
        <p className="text-white/40 text-xs mb-8">Sua senha foi atualizada com sucesso.</p>
        <a href="/" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
          Entrar no Studio <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-xl font-black text-white mb-2">Link Inválido</h1>
        <p className="text-white/40 text-xs mb-8">Este link de recuperação expirou ou é inválido.</p>
        <a href="/auth" className="text-blue-500 text-xs font-bold uppercase tracking-widest">Voltar ao Login</a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center px-8">
      <div className="mb-10 text-center">
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto mb-4">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="8" fill="#3b82f6" />
        </svg>
        <h1 className="text-xl font-black text-white tracking-tight">NOVA SENHA</h1>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Defina sua nova senha</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type={showPassword ? 'text' : 'password'} required value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Nova senha" minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-4 text-sm text-white outline-none focus:border-blue-500 transition-colors"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type={showPassword ? 'text' : 'password'} required value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha" minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs font-bold">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl border-b-4 border-blue-800 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Redefinir Senha <ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
}
