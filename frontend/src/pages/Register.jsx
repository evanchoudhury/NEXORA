import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSignup = async () => {
    try {
      setOauthLoading(true);
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: '480px', background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-block mb-2">
            <span className="brand-title" style={{ fontSize: '2.5rem', letterSpacing: '0.18em', color: '#171717' }}>
              NEXORA
            </span>
          </Link>
          <h2 className="h4 fw-normal text-dark mb-1" style={{ fontFamily: 'var(--font-editorial)' }}>Create Account</h2>
          <p className="text-secondary small mb-0">Join NEXORA to unlock member privileges & seamless checkout</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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
          <span>{oauthLoading ? 'Redirecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1 my-0" style={{ borderColor: 'var(--surface-border)' }} />
          <span className="px-3 text-secondary small" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or register with email
          </span>
          <hr className="flex-grow-1 my-0" style={{ borderColor: 'var(--surface-border)' }} />
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Full Name</label>
            <input
              type="text"
              required
              name="name"
              className="form-control nexora-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <input
              type="email"
              required
              name="email"
              className="form-control nexora-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control nexora-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Password</label>
            <input
              type="password"
              required
              name="password"
              className="form-control nexora-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small fw-semibold">Confirm Password</label>
            <input
              type="password"
              required
              name="confirmPassword"
              className="form-control nexora-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-type password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-lg btn-nexora w-100 py-3 mb-3">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Account'}
          </button>

          <div className="text-center text-secondary small">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary fw-semibold">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
