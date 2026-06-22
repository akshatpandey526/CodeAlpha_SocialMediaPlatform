import { useState } from 'react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';
import { Heart, MessageSquare, Trash2, Send, Clock } from 'lucide-react';

const PostCard = ({ post, onPostDeleted, setCurrentTab, setProfileUser }) => {
  const { user, token } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [isLiked, setIsLiked] = useState(post.likes ? post.likes.includes(user?._id) : false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async () => {
    if (!token) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 450);

    try {
      const res = await fetch(`${API_BASE}/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    } else {
      // Just run animation again
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 450);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;

    setCommenting(true);
    try {
      const res = await fetch(`${API_BASE}/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vibe?')) return;

    try {
      const res = await fetch(`${API_BASE}/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleUserSelect = (username) => {
    setProfileUser(username);
    setCurrentTab('profile');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const isOwner = user?._id === post.user?._id;

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '20px', marginBottom: '20px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div 
          onClick={() => handleUserSelect(post.user.username)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          {post.user.profilePic ? (
            <img
              src={getMediaUrl(post.user.profilePic)}
              alt={post.user.username}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {getInitials(post.user.username)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              @{post.user.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Post content body */}
      <div style={{ marginBottom: '16px' }}>
        {post.text && (
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            marginBottom: post.image ? '12px' : 0
          }}>
            {post.text}
          </p>
        )}
        
        {post.image && (
          <div 
            onDoubleClick={handleDoubleTap}
            style={{ 
              position: 'relative', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              border: '1px solid var(--glass-border)',
              maxHeight: '400px',
              backgroundColor: '#000',
              cursor: 'pointer'
            }}
          >
            {post.mediaType === 'video' ? (
              <video
                src={getMediaUrl(post.image)}
                controls
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <img
                src={getMediaUrl(post.image)}
                alt="Vibe Media"
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
              />
            )}
            {likeAnimating && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}>
                <Heart size={80} fill="var(--secondary-color)" color="var(--secondary-color)" className="heart-pop" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action controls footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '12px',
        color: 'var(--text-secondary)'
      }}>
        {/* Like trigger */}
        <button
          onClick={handleLike}
          style={{
            background: 'transparent',
            border: 'none',
            color: isLiked ? 'var(--secondary-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            transition: 'var(--transition-bounce)'
          }}
          onMouseEnter={(e) => { if (!isLiked) e.currentTarget.style.color = 'var(--secondary-color)'; }}
          onMouseLeave={(e) => { if (!isLiked) e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Heart size={18} fill={isLiked ? 'var(--secondary-color)' : 'transparent'} className={likeAnimating ? 'heart-pop' : ''} />
          <span>{likes.length}</span>
        </button>

        {/* Comment toggle trigger */}
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'transparent',
            border: 'none',
            color: showComments ? 'var(--primary-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => { if (!showComments) e.currentTarget.style.color = 'var(--primary-color)'; }}
          onMouseLeave={(e) => { if (!showComments) e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <MessageSquare size={18} />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comment section drawer */}
      {showComments && (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }} className="animate-slide-up">
          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>
                No comments yet. Start the conversation!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {comment.profilePic ? (
                    <img
                      src={getMediaUrl(comment.profilePic)}
                      alt={comment.username}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px' }}
                    />
                  ) : (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      color: '#fff',
                      marginTop: '2px',
                      flexShrink: 0
                    }}>
                      {getInitials(comment.username)}
                    </div>
                  )}
                  <div style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span 
                        onClick={() => handleUserSelect(comment.username)}
                        style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        @{comment.username}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatDate(comment.createdAt || new Date())}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form input */}
          {user && (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user.profilePic ? (
                <img
                  src={getMediaUrl(user.profilePic)}
                  alt={user.username}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  color: '#fff'
                }}>
                  {getInitials(user.username)}
                </div>
              )}
              <input
                type="text"
                className="glass-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  height: '34px',
                  borderRadius: '17px',
                  fontSize: '0.85rem',
                  padding: '0 16px',
                  flex: 1
                }}
              />
              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="bg-gradient-btn"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
