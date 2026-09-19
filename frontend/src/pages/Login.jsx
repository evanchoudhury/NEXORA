import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(true);
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="container py-5">
      <div className="mx-auto p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: '460px', background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-block mb-2">
            <span className="brand-title" style={{ fontSize: '2.5rem', letterSpacing: '0.18em', color: '#171717' }}>
              NEXORA
            </span>
          </Link>
          <p className="text-secondary small mb-0">Access your orders, saved wishlist, and Web3 wallet</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={oauthLoading}
          className="btn btn-outline-dark w-100 py-2.5 mb-3 d-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: '0.85rem', fontWeight: 500, borderColor: 'var(--surface-border)', background: '#FFFFFF' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>{oauthLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1 my-0" style={{ borderColor: 'var(--surface-border)' }} />
          <span className="px-3 text-secondary small" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or continue with email
          </span>
          <hr className="flex-grow-1 my-0" style={{ borderColor: 'var(--surface-border)' }} />
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="mb-4 p-3 rounded-3" style={{ background: '#171717', border: '1px solid #2B2B2B' }}>
          <div className="small fw-semibold text-uppercase mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.72rem', color: '#999999' }}>
            One-Click Demo Credentials
          </div>
          <div className="d-flex gap-2">
            <button type="button" onClick={() => handleDemoLogin('customer@nexora.com')} className="btn btn-sm btn-outline-light flex-fill" style={{ fontSize: '0.78rem', borderColor: '#444444' }}>
              Customer
            </button>
            <button type="button" onClick={() => handleDemoLogin('manager@nexora.com')} className="btn btn-sm btn-outline-light flex-fill" style={{ fontSize: '0.78rem', borderColor: '#444444' }}>
              Manager
            </button>
            <button type="button" onClick={() => handleDemoLogin('admin@nexora.com')} className="btn btn-sm btn-outline-light flex-fill" style={{ fontSize: '0.78rem', borderColor: '#444444' }}>
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <input
              type="email"
              required
              className="form-control nexora-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-secondary small fw-semibold mb-0">Password</label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Use demo password: Password@123'); }} className="text-secondary small">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              className="form-control nexora-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-lg btn-nexora w-100 py-3 mb-3">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Sign In'}
          </button>

          <div className="text-center text-secondary small">
            Don't have an account?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary fw-semibold">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
