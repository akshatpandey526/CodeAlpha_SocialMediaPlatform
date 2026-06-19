import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserSuggestions from './components/UserSuggestions';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import { RefreshCw } from 'lucide-react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [profileUser, setProfileUser] = useState(null);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '12px'
      }}>
        <RefreshCw size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
          Initializing VibeSpace...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar setCurrentTab={setCurrentTab} setProfileUser={setProfileUser} />

      {/* Main Grid Body Container */}
      <div className="main-container" style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 40px 24px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        {/* Left Column Sidebar */}
        <div style={{ position: 'sticky', top: '90px' }} className="sidebar-col">
          <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} setProfileUser={setProfileUser} />
        </div>

        {/* Middle Column View Switcher */}
        <main className="content-col" style={{ minWidth: 0 }}>
          {currentTab === 'home' && (
            <Home setCurrentTab={setCurrentTab} setProfileUser={setProfileUser} />
          )}
          {currentTab === 'explore' && (
            <Explore setCurrentTab={setCurrentTab} setProfileUser={setProfileUser} />
          )}
          {currentTab === 'profile' && (
            <Profile 
              username={profileUser || user.username} 
              setCurrentTab={setCurrentTab} 
              setProfileUser={setProfileUser} 
            />
          )}
        </main>

        {/* Right Column Suggestions */}
        <div style={{ position: 'sticky', top: '90px' }} className="suggestions-col">
          <UserSuggestions setCurrentTab={setCurrentTab} setProfileUser={setProfileUser} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
