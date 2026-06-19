import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ShieldAlert } from 'lucide-react';

const AuthPage = () => {
  const { login, register, authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (isLogin) {
      if (!email.trim() || !password) {
        setLocalError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const success = await login(email, password);
      if (!success) setLoading(false);
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setLocalError('Please fill in all fields');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        setLoading(false);
        return;
      }
      const success = await register(username, email, password);
      if (!success) setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '20px'
    }}>
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Branding header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            padding: '12px',
            borderRadius: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isLogin ? 'Sign in to see what your friends are up to' : 'Join VibeSpace and share your vibes today'}
          </p>
        </div>

        {/* Error notifications */}
        {(localError || authError) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.85rem'
          }} className="animate-fade-in">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-secondary)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                className="glass-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '42px' }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-secondary)" style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              className="glass-input"
              placeholder={isLogin ? 'Email or Username' : 'Email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '42px' }}
              disabled={loading}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-secondary)" style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="password"
              className="glass-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '42px' }}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-secondary)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="password"
                className="glass-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-gradient-btn"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '1rem',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Switch mode button */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError('');
            }}
            style={{
              color: 'var(--primary-color)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
