/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import { RefreshCw } from 'lucide-react';

const Home = ({ setCurrentTab, setProfileUser }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (showRefreshing = false) => {
    if (!token) return;
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setError('Failed to fetch timeline feed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Post creator widget */}
      <PostCreator onPostCreated={handlePostCreated} />

      {/* Feed actions header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Timeline
        </h2>
        <button
          onClick={() => fetchFeed(true)}
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

      {/* Feed content wrapper */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)', margin: '0 auto 12px auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gathering good vibes...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>No Vibes Yet</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
            Be the first one to share a post and start the vibe!
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

export default Home;
