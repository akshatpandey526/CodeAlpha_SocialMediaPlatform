import { useState, useEffect, useRef } from 'react';
import { useAuth, UPLOADS_BASE, API_BASE } from '../context/AuthContext';
import { Search, Sparkles, LogOut } from 'lucide-react';

const Navbar = ({ setCurrentTab, setProfileUser }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/users/search?q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleUserSelect = (username) => {
    setProfileUser(username);
    setCurrentTab('profile');
    setSearchQuery('');
    setShowDropdown(false);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderRadius: '0 0 var(--border-radius-md) var(--border-radius-md)',
      marginBottom: '24px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      {/* Brand logo */}
      <div 
        onClick={() => { setCurrentTab('home'); setProfileUser(null); }} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.5px' }}>
          Vibe-CodeAlpha
        </span>
      </div>

      {/* Search Input */}
      <div ref={dropdownRef} style={{ position: 'relative', width: '35%', minWidth: '200px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            className="glass-input"
            placeholder="Search vibes & friends..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{
              paddingLeft: '42px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              height: '38px',
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="glass-panel animate-slide-up" style={{
            position: 'absolute',
            top: '46px',
            left: 0,
            right: 0,
            borderRadius: 'var(--border-radius-md)',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'rgba(15, 15, 20, 0.95)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid var(--glass-border)',
            padding: '6px'
          }}>
            {searchResults.map((result) => (
              <div
                key={result._id}
                onClick={() => handleUserSelect(result.username)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                className="search-item"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {result.profilePic ? (
                  <img
                    src={`${UPLOADS_BASE}${result.profilePic}`}
                    alt={result.username}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    color: '#fff'
                  }}>
                    {getInitials(result.username)}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>@{result.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {result.bio || 'Vibing along...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Session Info / Profile Click */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            onClick={() => handleUserSelect(user.username)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            {user.profilePic ? (
              <img
                src={`${UPLOADS_BASE}${user.profilePic}`}
                alt={user.username}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-color)'
                }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#fff',
                border: '2px solid var(--primary-color)'
              }}>
                {getInitials(user.username)}
              </div>
            )}
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }} className="navbar-username">
              @{user.username}
            </span>
          </div>
          
          <button 
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'var(--transition-smooth)'
            }}
            title="Sign Out"
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
