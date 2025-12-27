
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Check } from 'lucide-react';

export const UpdatePassword: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('As senhas não conferem.');
    if (password.length < 6) return setError('Mínimo de 6 caracteres.');

    setLoading(true);
    
    // 1. Atualiza senha no Auth
    const { error: authError } = await supabase.auth.updateUser({ password });
    
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Marca primeiro acesso como falso no banco
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ is_first_login: false })
      .eq('id', user?.id);

    if (dbError) {
      console.error(dbError);
      setError('Erro ao atualizar perfil.');
    } else {
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="w-16 h-16 bg-green-600/20 text-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
        <ShieldCheck size={32} />
      </div>

      <header className="text-center mb-10">
        <h2 className="text-2xl font-black italic uppercase mb-2">Segurança em Primeiro Lugar</h2>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-[200px] mx-auto">
          Este é seu primeiro acesso. Defina uma senha definitiva para continuar.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-zinc-600 outline-none focus:ring-2 ring-blue-500 transition-all"
            placeholder="Nova Senha"
          />
        </div>

        <div className="relative">
          <Check className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-zinc-600 outline-none focus:ring-2 ring-blue-500 transition-all"
            placeholder="Confirmar Senha"
          />
        </div>

        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Ativar Minha Conta'}
        </button>
      </form>
    </div>
  );
};
