import { useAuth, UPLOADS_BASE } from '../context/AuthContext';
import { Home, Compass, User, LogOut } from 'lucide-react';

const Sidebar = ({ currentTab, setCurrentTab, setProfileUser }) => {
  const { user, logout } = useAuth();

  const handleTabClick = (tab) => {
    if (tab === 'profile' && user) {
      setProfileUser(user.username);
    } else {
      setProfileUser(null);
    }
    setCurrentTab(tab);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const menuItems = [
    { id: 'home', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation panel */}
      <div className="glass-panel sidebar-nav" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="sidebar-nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <IconComponent size={20} color={isActive ? 'var(--primary-color)' : 'var(--text-secondary)'} />
              <span>{item.label}</span>
            </div>
          );
        })}

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '8px 0' }} />

        <div
          onClick={logout}
          className="sidebar-nav-item logout-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            fontWeight: 500,
            color: '#ef4444',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>

      {/* Mini Profile card panel */}
      {user && (
        <div className="glass-panel sidebar-profile-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div 
            onClick={() => handleTabClick('profile')}
            style={{ display: 'inline-block', cursor: 'pointer', position: 'relative', marginBottom: '12px' }}
          >
            {user.profilePic ? (
              <img
                src={`${UPLOADS_BASE}${user.profilePic}`}
                alt={user.username}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-color)',
                  boxShadow: '0 0 15px var(--primary-glow)'
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                color: '#fff',
                border: '2px solid var(--primary-color)',
                boxShadow: '0 0 15px var(--primary-glow)'
              }}>
                {getInitials(user.username)}
              </div>
            )}
          </div>

          <h4 
            onClick={() => handleTabClick('profile')}
            style={{ fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            @{user.username}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {user.bio || 'Sharing positive vibes'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {user.followers ? user.followers.length : 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers</div>
            </div>
            <div style={{ borderRight: '1px solid var(--glass-border)' }}></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {user.following ? user.following.length : 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Following</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
