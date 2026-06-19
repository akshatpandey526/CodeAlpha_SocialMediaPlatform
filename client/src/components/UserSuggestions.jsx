import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE, UPLOADS_BASE } from '../context/AuthContext';
import { UserPlus, Check } from 'lucide-react';

const UserSuggestions = ({ setCurrentTab, setProfileUser }) => {
  const { user, token, followUser } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users/suggestions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user?.following, token]);

  const handleFollowClick = async (targetUserId, e) => {
    e.stopPropagation();
    await followUser(targetUserId);
    // Optimistically update lists or refetch
    setSuggestions(prev => prev.filter(item => item._id !== targetUserId));
  };

  const handleUserSelect = (username) => {
    setProfileUser(username);
    setCurrentTab('profile');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
          Finding vibers...
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show anything if no recommendations are found
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        Vibers to Follow
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {suggestions.map((item) => (
          <div
            key={item._id}
            onClick={() => handleUserSelect(item.username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {item.profilePic ? (
                <img
                  src={`${UPLOADS_BASE}${item.profilePic}`}
                  alt={item.username}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {getInitials(item.username)}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  @{item.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.bio || 'Sharing vibes'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => handleFollowClick(item._id, e)}
              className="bg-gradient-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                flexShrink: 0
              }}
              title={`Follow @${item.username}`}
            >
              <UserPlus size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSuggestions;
