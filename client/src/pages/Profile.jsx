import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE, UPLOADS_BASE } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Camera, Edit3, X, RefreshCw, UserCheck, UserPlus, Grid, List } from 'lucide-react';

const Profile = ({ username, setCurrentTab, setProfileUser }) => {
  const { user: currentUser, token, followUser, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Profile Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPicFile, setCoverPicFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // View state: Grid or List
  const [viewMode, setViewMode] = useState('list');

  const fetchProfileAndPosts = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch profile details
      const profileRes = await fetch(`${API_BASE}/users/${username}`);
      if (!profileRes.ok) {
        throw new Error('User profile not found');
      }
      const profile = await profileRes.json();
      setProfileData(profile);
      setBio(profile.bio || '');

      // 2. Fetch posts
      const postsRes = await fetch(`${API_BASE}/posts/user/${username}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [username, currentUser?.following]);

  const handleFollowToggle = async () => {
    if (!profileData || !token) return;
    const resData = await followUser(profileData._id);
    if (resData) {
      // Toggle count manually to reflect immediately
      setProfileData(prev => {
        const isFollowing = resData.isFollowing;
        const currentFollowers = prev.followers || [];
        return {
          ...prev,
          followers: isFollowing 
            ? [...currentFollowers, { _id: currentUser._id, username: currentUser.username, profilePic: currentUser.profilePic }]
            : currentFollowers.filter(f => f._id !== currentUser._id)
        };
      });
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');
    try {
      const updatedUser = await updateProfile(bio, profilePicFile, coverPicFile);
      setProfileData(prev => ({
        ...prev,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        coverPic: updatedUser.coverPic
      }));
      setShowEditModal(false);
      // Reset files
      setProfilePicFile(null);
      setCoverPicFile(null);
      setProfilePreview('');
      setCoverPreview('');
    } catch (err) {
      setUpdateError(err.message || 'Profile update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const isSelf = currentUser?.username === username;
  const isFollowing = profileData?.followers?.some(f => f._id === currentUser?._id);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)', margin: '0 auto 12px auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vibing with profile details...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <h3 style={{ marginBottom: '10px' }}>Oops!</h3>
        <p>{error || 'Profile could not be loaded'}</p>
        <button 
          onClick={() => { setCurrentTab('home'); setProfileUser(null); }}
          className="bg-gradient-btn"
          style={{ padding: '8px 20px', borderRadius: '20px', marginTop: '16px' }}
        >
          Back Feed
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Banner / Cover and Avatar header card */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        {/* Cover banner image */}
        {profileData.coverPic ? (
          <div style={{ height: '180px', width: '100%', background: `url(${UPLOADS_BASE}${profileData.coverPic}) center/cover no-repeat` }}></div>
        ) : (
          <div style={{ height: '180px', width: '100%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', opacity: 0.85 }}></div>
        )}

        <div style={{ padding: '20px 24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Avatar display */}
          <div style={{
            position: 'absolute',
            top: '-55px',
            left: '24px'
          }}>
            {profileData.profilePic ? (
              <img
                src={`${UPLOADS_BASE}${profileData.profilePic}`}
                alt={profileData.username}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #09090b',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '2.5rem',
                color: '#fff',
                border: '4px solid #09090b',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
              }}>
                {getInitials(profileData.username)}
              </div>
            )}
          </div>

          {/* Action button: Edit profile / Follow */}
          <div style={{ alignSelf: 'flex-end', minHeight: '38px' }}>
            {isSelf ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  padding: '8px 16px',
                  borderRadius: '20px'
                }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            ) : (
              currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className="bg-gradient-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none'
                  }}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={15} />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )
            )}
          </div>

          {/* User info text */}
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              @{profileData.username}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              marginTop: '8px',
              whiteSpace: 'pre-wrap'
            }}>
              {profileData.bio || 'Vibing in silence...'}
            </p>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex',
            gap: '24px',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '14px',
            marginTop: '6px'
          }}>
            <div style={{ display: 'flex', gap: '6px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>{profileData.followers?.length || 0}</span>
              <span style={{ color: 'var(--text-secondary)' }}>followers</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>{profileData.following?.length || 0}</span>
              <span style={{ color: 'var(--text-secondary)' }}>following</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>{posts.length}</span>
              <span style={{ color: 'var(--text-secondary)' }}>vibes</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's own posts stream header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
          @{profileData.username}'s Vibes
        </h3>
        
        {/* Grid/List views switcher */}
        <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: viewMode === 'list' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: viewMode === 'grid' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Profile posts content */}
      {posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No vibes shared yet.</p>
        </div>
      ) : viewMode === 'list' ? (
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
      ) : (
        /* Grid Display */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => { setViewMode('list'); }}
              className="glass-panel animate-slide-up"
              style={{
                position: 'relative',
                aspectRatio: '1',
                overflow: 'hidden',
                cursor: 'pointer',
                borderRadius: '12px'
              }}
            >
              {post.image ? (
                <img
                  src={`${UPLOADS_BASE}${post.image}`}
                  alt="Post Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}>
                  <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' }}>
                    {post.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal backdrop */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="animate-fade-in">
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(15, 15, 20, 0.98)',
            border: '1px solid var(--glass-border)',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            {/* Modal close icon */}
            <button
              onClick={() => {
                setShowEditModal(false);
                setProfilePreview('');
                setCoverPreview('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Profile</h3>

            {updateError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{updateError}</p>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Cover Pic Upload */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Cover Banner
                </label>
                <div style={{
                  position: 'relative',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: coverPreview 
                    ? `url(${coverPreview}) center/cover no-repeat` 
                    : profileData.coverPic 
                      ? `url(${UPLOADS_BASE}${profileData.coverPic}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('cover-file-input').click()}
                >
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%' }}>
                    <Camera size={18} color="#fff" />
                  </div>
                  <input
                    type="file"
                    id="cover-file-input"
                    onChange={handleCoverPicChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Profile Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => document.getElementById('profile-file-input').click()}
                >
                  {profilePreview ? (
                    <img src={profilePreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : profileData.profilePic ? (
                    <img src={`${UPLOADS_BASE}${profileData.profilePic}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.2rem' }}>
                      {getInitials(profileData.username)}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={14} color="#fff" />
                  </div>
                  <input
                    type="file"
                    id="profile-file-input"
                    onChange={handleProfilePicChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Profile Photo</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click image to select new file</p>
                </div>
              </div>

              {/* Biography textarea */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Bio
                </label>
                <textarea
                  className="glass-input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your vibe..."
                  maxLength={160}
                />
              </div>

              {/* Submit / Cancel Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-btn"
                  disabled={updating}
                  style={{ padding: '8px 24px', borderRadius: '8px' }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
