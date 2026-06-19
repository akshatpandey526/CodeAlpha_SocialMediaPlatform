import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { RefreshCw, Compass } from 'lucide-react';

const Explore = ({ setCurrentTab, setProfileUser }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchExplore = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/posts/explore`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setError('Failed to fetch explore feed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading explore posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--primary-color)'
          }}>
            <Compass size={20} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Explore Vibes
          </h2>
        </div>
        <button
          onClick={() => fetchExplore(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)', margin: '0 auto 12px auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exploring spaces...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Empty Space</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
            No posts exist yet. Be the first to share your vibe!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              setCurrentTab={setCurrentTab}
              setProfileUser={setProfileUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
