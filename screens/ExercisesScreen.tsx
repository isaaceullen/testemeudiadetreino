
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Edit2, Check, X, SlidersHorizontal, Package, UserPlus } from 'lucide-react';

export const ExercisesScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [systemExercises, setSystemExercises] = useState<any[]>([]);
  const [userExercises, setUserExercises] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [search, setSearch] = useState('');

  // Batch config state
  const [configData, setConfigData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sys } = await supabase.from('system_exercises').select('*').order('name');
    const { data: usr } = await supabase.from('user_exercises').select('*').eq('user_id', user?.id).order('created_at');
    if (sys) setSystemExercises(sys);
    if (usr) setUserExercises(usr);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const startConfig = () => {
    const initialConfig = {};
    selectedIds.forEach(id => {
      const ex = systemExercises.find(x => x.id === id);
      initialConfig[id] = { 
        sets: 3, 
        reps: 10, 
        weight: 0,
        name: ex.name,
        category: ex.category,
        media_url: ex.media_url
      };
    });
    setConfigData(initialConfig);
    setIsConfigMode(true);
  };

  const applyToAll = (field: string, value: any) => {
    const newConfig = { ...configData };
    Object.keys(newConfig).forEach(id => {
      newConfig[id][field] = value;
    });
    setConfigData(newConfig);
  };

  const saveBatch = async () => {
    const payloads = Object.values(configData).map((c: any) => ({
      ...c,
      user_id: user?.id,
      target_sets: c.sets,
      target_reps: c.reps,
      weight: c.weight
    }));

    await supabase.from('user_exercises').insert(payloads);
    setSelectedIds([]);
    setIsConfigMode(false);
    setIsModalOpen(false);
    fetchData();
  };

  const removeUserExercise = async (id: string) => {
    if (!confirm('Excluir do seu treino?')) return;
    await supabase.from('user_exercises').delete().eq('id', id);
    fetchData();
  };

  const filteredCatalog = systemExercises.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 pb-32 animate-in fade-in duration-500">
      <header className="flex justify-between items-center pt-4 mb-10">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Meu Acervo</h2>
          <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">{userExercises.length} Exercícios em Plano</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {userExercises.map(ex => (
          <div key={ex.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex justify-between items-center">
            <div className="max-w-[70%]">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">{ex.category}</span>
              <h4 className="text-lg font-black italic uppercase text-white leading-tight">{ex.name}</h4>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{ex.target_sets}x{ex.target_reps} • {ex.weight}kg</p>
            </div>
            <button onClick={() => removeUserExercise(ex.id)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {userExercises.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-zinc-800/50">
            <p className="text-zinc-700 font-black uppercase text-xs tracking-widest italic">Nenhum exercício adicionado.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-500 font-black uppercase text-[10px] tracking-widest underline underline-offset-4">Explorar Catálogo</button>
          </div>
        )}
      </div>

      {/* MODAL DE ADIÇÃO EM LOTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black z-[100] animate-in slide-in-from-bottom duration-300 flex flex-col">
          <header className="p-8 pb-4 flex justify-between items-center border-b border-zinc-900">
            <h3 className="text-2xl font-black italic uppercase">Adicionar Exercícios</h3>
            <button onClick={() => setIsModalOpen(false)} className="bg-zinc-900 p-4 rounded-2xl text-zinc-500"><X size={24} /></button>
          </header>

          <div className="p-8 flex-1 overflow-y-auto">
            {!isConfigMode ? (
              <div className="space-y-8">
                <div className="flex gap-2">
                   <button onClick={() => setActiveTab('catalog')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${activeTab === 'catalog' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}><Package size={16}/> Catálogo</button>
                   <button onClick={() => setActiveTab('custom')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${activeTab === 'custom' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}><UserPlus size={16}/> Custom</button>
                </div>

                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input placeholder="Buscar no sistema..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-4 pl-14 pr-6 text-sm outline-none" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredCatalog.map(ex => (
                    <button key={ex.id} onClick={() => toggleSelect(ex.id)} className={`p-5 rounded-[2rem] border transition-all flex justify-between items-center text-left ${selectedIds.includes(ex.id) ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-zinc-950 border-zinc-800'}`}>
                      <div>
                        <span className="text-[8px] font-black text-blue-500 uppercase block mb-0.5">{ex.category}</span>
                        <h4 className="font-black italic uppercase text-sm">{ex.name}</h4>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIds.includes(ex.id) ? 'bg-blue-500 border-white text-white' : 'border-zinc-800'}`}>
                        {selectedIds.includes(ex.id) && <Check size={16} strokeWidth={4}/>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="bg-zinc-950 p-6 rounded-[2.5rem] border border-zinc-800 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Configuração Global</h4>
                    <span className="text-[10px] font-black text-zinc-700 uppercase">{selectedIds.length} Itens</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => applyToAll('sets', 3)} className="bg-zinc-900 py-3 rounded-xl text-[9px] font-black uppercase border border-zinc-800 active:scale-90">3 Séries</button>
                    <button onClick={() => applyToAll('reps', 12)} className="bg-zinc-900 py-3 rounded-xl text-[9px] font-black uppercase border border-zinc-800 active:scale-90">12 Reps</button>
                    <button onClick={() => applyToAll('sets', 4)} className="bg-zinc-900 py-3 rounded-xl text-[9px] font-black uppercase border border-zinc-800 active:scale-90">4 Séries</button>
                  </div>
                </div>

                {selectedIds.map(id => {
                  const data = configData[id];
                  return (
                    <div key={id} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 space-y-4">
                      <h4 className="font-black italic uppercase text-blue-500">{data.name}</h4>
                      <div className="grid grid-cols-3 gap-3">
                         <div className="space-y-1 text-center">
                           <label className="text-[8px] font-black text-zinc-600 uppercase">Séries</label>
                           <input type="number" value={data.sets} onChange={e => setConfigData({...configData, [id]: {...data, sets: Number(e.target.value)}})} className="w-full bg-black border border-zinc-800 py-3 rounded-xl text-center text-sm font-black outline-none" />
                         </div>
                         <div className="space-y-1 text-center">
                           <label className="text-[8px] font-black text-zinc-600 uppercase">Reps</label>
                           <input type="number" value={data.reps} onChange={e => setConfigData({...configData, [id]: {...data, reps: Number(e.target.value)}})} className="w-full bg-black border border-zinc-800 py-3 rounded-xl text-center text-sm font-black outline-none" />
                         </div>
                         <div className="space-y-1 text-center">
                           <label className="text-[8px] font-black text-zinc-600 uppercase">Peso (kg)</label>
                           <input type="number" value={data.weight} onChange={e => setConfigData({...configData, [id]: {...data, weight: Number(e.target.value)}})} className="w-full bg-black border border-zinc-800 py-3 rounded-xl text-center text-sm font-black outline-none" />
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-8 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
            {isConfigMode ? (
              <div className="flex gap-3">
                <button onClick={() => setIsConfigMode(false)} className="flex-1 bg-zinc-900 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest text-zinc-600 border border-zinc-800">Voltar</button>
                <button onClick={saveBatch} className="flex-[2] bg-blue-600 py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl flex items-center justify-center gap-2">Finalizar <Check size={20}/></button>
              </div>
            ) : (
              <button 
                disabled={selectedIds.length === 0} 
                onClick={startConfig}
                className={`w-full py-6 rounded-[2rem] font-black italic uppercase text-lg flex items-center justify-center gap-3 transition-all ${selectedIds.length > 0 ? 'bg-white text-black shadow-2xl' : 'bg-zinc-900 text-zinc-800 opacity-50 cursor-not-allowed'}`}
              >
                Próximo ({selectedIds.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
