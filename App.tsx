
import React, { useState, FC } from 'react';
import { FEATURES, FeatureID } from './constants';
import { IconBook, IconMenu, IconX, IconUser, IconLogout } from './components/Icons';
import ChatPanel from './components/ChatPanel';
import GroundedSearchPanel from './components/GroundedSearchPanel';
import MediaAnalysisPanel from './components/MediaAnalysisPanel';
import ImageGenerationPanel from './components/ImageGenerationPanel';
import ComplexQueryPanel from './components/ComplexQueryPanel';
import LiveConversationPanel from './components/LiveConversationPanel';
import AuthGate from './components/AuthGate';
import { useAuth } from './hooks/useAuth';
import DashboardPanel from './components/DashboardPanel';
import ExercisesPanel from './components/ExercisesPanel';
import LeaderboardPanel from './components/LeaderboardPanel';

const App: React.FC = () => {
  return (
    <AuthGate>
      <MainApp />
    </AuthGate>
  );
};

const MainApp: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureID>(FeatureID.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case FeatureID.Dashboard:
        return <DashboardPanel />;
      case FeatureID.Exercises:
        return <ExercisesPanel />;
      case FeatureID.Leaderboard:
        return <LeaderboardPanel />;
      case FeatureID.Chat:
        return <ChatPanel />;
      case FeatureID.GroundedSearch:
        return <GroundedSearchPanel />;
      case FeatureID.MediaAnalysis:
        return <MediaAnalysisPanel />;
      case FeatureID.ImageGeneration:
        return <ImageGenerationPanel />;
      case FeatureID.ComplexQuery:
        return <ComplexQueryPanel />;
      case FeatureID.LiveConversation:
        return <LiveConversationPanel />;
      default:
        return <DashboardPanel />;
    }
  };

  const handleFeatureSelect = (id: FeatureID) => {
    setActiveFeature(id);
    if(window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const NavLink: FC<{ featureId: FeatureID }> = ({ featureId }) => {
    const feature = FEATURES[featureId];
    const isActive = activeFeature === featureId;
    return (
      <button
        onClick={() => handleFeatureSelect(featureId)}
        className={`flex items-center w-full px-4 py-3 text-left transition-all duration-300 relative overflow-hidden group ${
          isActive
            ? 'text-cyan-300'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <span className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 bg-cyan-400 ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></span>
        <span className={`absolute left-0 top-0 w-full h-full bg-cyan-400/10 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
        <feature.icon className={`w-6 h-6 mr-4 z-10 transition-colors duration-300 ${isActive ? 'text-cyan-300' : ''}`} />
        <span className="truncate z-10 text-sm font-bold tracking-wider">{feature.name}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen text-gray-100 font-sans main-background">
      {/* Mobile menu button */}
      <button 
        className="md:hidden p-4 fixed top-0 left-0 z-30 text-cyan-300" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <IconX /> : <IconMenu />}
      </button>
      
      {/* Sidebar */}
      <aside className={`bg-black/40 backdrop-blur-md border-r border-cyan-400/20 w-64 fixed md:relative h-full z-20 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-5 border-b border-cyan-400/20 flex items-center space-x-3">
          <IconBook className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold uppercase tracking-widest text-cyan-300">Science Hub</h1>
        </div>
        <nav className="p-2 space-y-1 flex-1">
            {Object.values(FeatureID).map((id) => <NavLink key={id} featureId={id} />)}
        </nav>
        {user && (
          <div className="p-4 border-t border-cyan-400/20">
            <div className="flex items-center mb-3">
              <IconUser className="w-6 h-6 text-cyan-400 mr-3" />
              <span className="font-bold text-white">{user.username}</span>
            </div>
            <button onClick={logout} className="w-full game-button secondary text-sm flex items-center justify-center">
              <IconLogout className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
            {renderFeatureComponent()}
        </div>
      </main>
    </div>
  );
};

export default App;