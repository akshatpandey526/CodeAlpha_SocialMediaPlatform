import { useState, useRef } from 'react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';
import { Image, Send, X, Loader } from 'lucide-react';

const PostCreator = ({ onPostCreated }) => {
  const { token, user } = useAuth();
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState(''); // 'image' or 'video'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
      const sizeLimitText = isVideo ? '100MB' : '10MB';

      if (file.size > maxSize) {
        setError(`File size cannot exceed ${sizeLimitText}`);
        return;
      }
      setError('');
      setMediaFile(file);
      setMediaType(isVideo ? 'video' : 'image');
      
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview('');
    setMediaType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) {
      setError('Please add some text or media to share your vibe');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (mediaFile) {
        formData.append('image', mediaFile);
      }

      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      // Success
      setText('');
      clearMedia();
      if (onPostCreated) {
        onPostCreated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const emojis = ['✨', '🚀', '🔥', '💖', '👀', '💡', '🌈', '🎉'];
  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {user?.profilePic ? (
            <img
              src={getMediaUrl(user.profilePic)}
              alt={user.username}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {getInitials(user?.username)}
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <textarea
              className="glass-input"
              rows={3}
              placeholder="What's your vibe today? Share updates or upload media..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                resize: 'none',
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                fontSize: '1rem',
                lineHeight: '1.5',
                width: '100%',
                borderRadius: 0,
                boxShadow: 'none'
              }}
            />
            
            {/* Media Preview Container */}
            {mediaPreview && (
              <div style={{ position: 'relative', marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', maxHeight: '350px', backgroundColor: '#000' }}>
                {mediaType === 'video' ? (
                  <video
                    src={mediaPreview}
                    controls
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Post preview"
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0 8px' }}>
            {error}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'var(--transition-smooth)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Image size={18} />
              <span>Media</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />

            {/* Quick Emojis Drawer */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-btn"
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              height: '38px',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <span>Vibe</span>
                <Send size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreator;
