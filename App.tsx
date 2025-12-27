
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './screens/Login';
import { UpdatePassword } from './screens/UpdatePassword';
import { AdminDashboard } from './screens/AdminDashboard';
import { HomeScreen } from './screens/HomeScreen';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { Home, Dumbbell, Calendar, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useWorkoutManager } from './hooks/useWorkoutManager';
import { CustomDialog } from './components/CustomDialog';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const workoutManager = useWorkoutManager();
  const [activeTab, setActiveTab] = React.useState<'home' | 'exercises' | 'history' | 'settings' | 'admin'>('home');

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Login />;
  
  // Guard de Primeiro Login
  if (profile?.is_first_login) return <UpdatePassword />;

  if (workoutManager.activeDraft) {
    return (
      <>
        <ActiveWorkoutScreen manager={workoutManager} />
        <CustomDialog {...workoutManager.dialog} />
      </>
    );
  }

  const renderContent = () => {
    if (activeTab === 'admin' && profile?.role === 'admin') return <AdminDashboard />;
    switch (activeTab) {
      case 'home': return <HomeScreen manager={workoutManager} />;
      case 'exercises': return <ExercisesScreen manager={workoutManager} />;
      case 'history': return <HistoryScreen manager={workoutManager} />;
      case 'settings': return <ConfigScreen manager={workoutManager} />;
      default: return <HomeScreen manager={workoutManager} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-900 max-w-lg mx-auto z-50">
        <div className="flex justify-around items-center h-20 px-2">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label="Início" />
          <NavButton active={activeTab === 'exercises'} onClick={() => setActiveTab('exercises')} icon={<Dumbbell size={22} />} label="Acervo" />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar size={22} />} label="Evolução" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={22} />} label="Ajustes" />
          {profile?.role === 'admin' && (
            <NavButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<ShieldCheck size={22} />} label="Admin" />
          )}
        </div>
      </nav>

      <CustomDialog {...workoutManager.dialog} />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
