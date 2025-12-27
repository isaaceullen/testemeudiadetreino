
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dumbbell, Lock, Mail, ChevronRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Acesso negado. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/40 rotate-12">
        <Dumbbell size={40} className="text-white -rotate-12" />
      </div>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
          Meu Dia <br/><span className="text-blue-500">de Treino</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Acesso restrito para alunos</p>
      </header>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder-zinc-600 outline-none focus:ring-2 ring-blue-500 transition-all"
            placeholder="Seu e-mail"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder-zinc-600 outline-none focus:ring-2 ring-blue-500 transition-all"
            placeholder="Sua senha"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold text-center animate-bounce">{error}</p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-white text-black py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Entrando...' : (
            <>Entrar <ChevronRight size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
};
