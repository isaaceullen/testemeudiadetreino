
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { User, LogOut, Camera, ShieldAlert, Timer, Database, Download, Upload, Info, ExternalLink } from 'lucide-react';

export const ConfigScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { state, setState, exportData, importData, showDialog } = manager;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert('Erro ao subir imagem.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user?.id);

    await refreshProfile();
    setUploading(false);
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 pb-32">
      <header className="pt-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ajustes</h2>
      </header>

      {/* Perfil & Avatar */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl">
        <div className="relative group mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600/30 bg-zinc-800 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-zinc-600" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-black"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          {uploading && <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-[8px] font-black uppercase">Subindo...</div>}
        </div>
        
        <h3 className="font-black italic uppercase text-white">{profile?.email.split('@')[0]}</h3>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">{profile?.role} • {profile?.email}</p>
        
        <button 
          onClick={signOut}
          className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
        >
          <LogOut size={16} /> Sair do App
        </button>
      </section>

      {/* Preferências */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
           <Timer size={20} className="text-blue-500" />
           <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Preferências</h3>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-sm italic uppercase text-white">Timer Automático</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Abrir ao marcar série</p>
          </div>
          <button 
            onClick={() => setState((prev: any) => ({ ...prev, settings: { ...prev.settings, autoTimer: !prev.settings.autoTimer }}))}
            className={`w-14 h-8 rounded-full transition-all relative ${state.settings.autoTimer ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${state.settings.autoTimer ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      {/* Info & Backup */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
           <Database size={20} className="text-blue-500" />
           <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Dados Locais</h3>
        </div>
        <div className="space-y-3">
          <button onClick={exportData} className="w-full flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all">
             <div className="flex items-center gap-4">
                <Download size={18} className="text-zinc-600" />
                <span className="text-[10px] font-black uppercase text-white">Exportar Sessões</span>
             </div>
          </button>
          <button onClick={() => { if(confirm('Limpar histórico local?')) setState({...state, sessions: []}) }} className="w-full flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all">
             <div className="flex items-center gap-4">
                <ShieldAlert size={18} className="text-red-500" />
                <span className="text-[10px] font-black uppercase text-red-500">Limpar Histórico</span>
             </div>
          </button>
        </div>
      </section>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2rem] p-6 flex gap-3">
        <Info size={20} className="text-blue-500 shrink-0" />
        <p className="text-[10px] text-blue-400 font-bold uppercase leading-relaxed tracking-wider">
          O catálogo de exercícios é gerenciado pelo instrutor. Se faltar algum item, solicite ao administrador.
        </p>
      </div>
    </div>
  );
};
