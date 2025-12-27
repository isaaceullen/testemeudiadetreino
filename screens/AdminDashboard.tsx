
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Upload, Link2, Check, X, FileVideo, ImageIcon, Search } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'link'>('link');
  const [mediaUrl, setMediaUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data } = await supabase.from('system_exercises').select('*').order('created_at', { ascending: false });
    if (data) setExercises(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const isVideo = selectedFile.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalUrl = mediaUrl;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('system-media')
        .upload(fileName, file);

      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('system-media').getPublicUrl(fileName);
        finalUrl = publicUrl;
      } else {
        console.error(error);
      }
    }

    const { error } = await supabase.from('system_exercises').insert([{
      name,
      category,
      media_url: finalUrl,
      media_type: mediaType
    }]);

    if (!error) {
      fetchExercises();
      closeModal();
    }
    setLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName('');
    setCategory('');
    setMediaUrl('');
    setFile(null);
  };

  const deleteExercise = async (id: string) => {
    if (!confirm('Excluir do catálogo global?')) return;
    await supabase.from('system_exercises').delete().eq('id', id);
    fetchExercises();
  };

  const filtered = exercises.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 pb-32 animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-10 pt-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Painel Admin</h2>
          <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Controle de Catálogo</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
        <input 
          placeholder="Buscar no sistema..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-14 pr-6 text-white outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] flex justify-between items-center group">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-zinc-600">
                {ex.media_type === 'video' ? <FileVideo size={20}/> : <ImageIcon size={20}/>}
              </div>
              <div>
                <h4 className="font-black italic uppercase text-sm">{ex.name}</h4>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">{ex.category}</p>
              </div>
            </div>
            <button onClick={() => deleteExercise(ex.id)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black z-[100] animate-in slide-in-from-bottom duration-300 overflow-y-auto">
          <div className="p-8 pb-20 max-w-lg mx-auto">
            <header className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic uppercase text-blue-500">Novo Global</h3>
              <button onClick={closeModal} className="bg-zinc-900 p-4 rounded-2xl text-zinc-500"><X size={24} /></button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categoria</label>
                <input required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none" placeholder="Ex: Peitoral" />
              </div>

              <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-800 space-y-4">
                 <div className="flex justify-between items-center px-1">
                   <h4 className="text-[10px] font-black text-zinc-600 uppercase">Mídia de Execução</h4>
                   <div className="flex gap-2">
                      <button type="button" onClick={() => {setFile(null); setMediaType('link')}} className={`p-2 rounded-lg ${!file ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-600'}`}><Link2 size={16}/></button>
                      <button type="button" className={`p-2 rounded-lg ${file ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-600'}`}><Upload size={16}/></button>
                   </div>
                 </div>

                 {file ? (
                   <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase text-blue-400 truncate max-w-[150px]">{file.name}</span>
                     <button type="button" onClick={() => setFile(null)}><X size={16}/></button>
                   </div>
                 ) : (
                   <>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      accept="image/*,video/*" 
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload" className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all">
                      <Upload size={24} className="text-zinc-700 mb-2"/>
                      <span className="text-[10px] font-black text-zinc-700 uppercase">Fazer Upload</span>
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16}/>
                      <input 
                        value={mediaUrl} 
                        onChange={e => {setMediaUrl(e.target.value); setMediaType('link')}} 
                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 pl-12 text-xs outline-none" 
                        placeholder="Ou cole o link externo..."
                      />
                    </div>
                   </>
                 )}
              </div>

              <button disabled={loading} type="submit" className="w-full bg-blue-600 py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl disabled:opacity-50">
                {loading ? 'Salvando...' : 'Adicionar ao Sistema'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
