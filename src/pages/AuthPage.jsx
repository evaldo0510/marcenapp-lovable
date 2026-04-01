import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HexLogo from '../components/HexLogo';

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
    <div className="fixed inset-0 bg-gradient-to-br from-white via-[hsl(211,100%,98%)] to-[hsl(211,100%,95%)] flex flex-col items-center justify-center px-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[hsl(211,100%,50%)]/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[hsl(211,100%,50%)]/4 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[hsl(211,100%,50%)]/3 blur-3xl"
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        className="relative mb-10 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-8 rounded-full border border-[hsl(211,100%,50%)]/5 border-dashed"
        />
        <HexLogo size={80} active />

        <motion.h1
          className="text-2xl font-black tracking-tight mt-5 font-['Orbitron',sans-serif]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-foreground">IARA</span>{' '}
          <span className="bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(211,100%,40%)] bg-clip-text text-transparent">STUDIO</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.35em] mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Sistema Industrial Inteligente
        </motion.p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute -inset-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-[hsl(211,100%,50%)]/8 shadow-[0_8px_40px_-12px_hsl(211,100%,50%,0.12)]" />

        <div className="relative space-y-4 p-1">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 z-10" />
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-white/80 border border-border/60 rounded-2xl pl-11 pr-4 py-4 text-sm text-foreground outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_hsl(211,100%,50%,0.08)] transition-all placeholder:text-muted-foreground/50"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 z-10" />
            <input
              type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Senha" minLength={6}
              className="w-full bg-white/80 border border-border/60 rounded-2xl pl-11 pr-11 py-4 text-sm text-foreground outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_hsl(211,100%,50%,0.08)] transition-all placeholder:text-muted-foreground/50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors z-10">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="bg-destructive/8 border border-destructive/15 rounded-xl px-4 py-3 text-destructive text-xs font-bold"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-4 py-3 text-emerald-600 text-xs font-bold"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(211,100%,42%)] text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_8px_30px_-6px_hsl(211,100%,50%,0.4)] hover:shadow-[0_12px_40px_-6px_hsl(211,100%,50%,0.5)] disabled:opacity-50 border-b-[3px] border-[hsl(211,100%,35%)]"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>{isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight size={16} /></>
            )}
          </motion.button>

          <motion.div
            className="flex flex-col items-center gap-2 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              type="button" onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
              className="text-muted-foreground text-xs font-bold py-2 hover:text-primary transition-colors"
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
                className="text-muted-foreground/50 text-[10px] font-bold py-1 hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </button>
            )}
          </motion.div>
        </div>
      </motion.form>

      {/* Bottom badge */}
      <motion.div
        className="absolute bottom-8 flex items-center gap-2 text-muted-foreground/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="w-6 h-px bg-muted-foreground/15" />
        <span className="text-[7px] font-bold uppercase tracking-[0.4em]">Alvenaria Digital</span>
        <div className="w-6 h-px bg-muted-foreground/15" />
      </motion.div>
    </div>
  );
}
