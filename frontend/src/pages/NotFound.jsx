import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center my-5">
      <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '520px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <h1 className="display-1 fw-bold gradient-text mb-2">404</h1>
        <h4 className="text-white mb-3">Page Not Found</h4>
        <p className="text-secondary small mb-4">
          The requested route does not exist or has been moved. Explore our catalog to find what you are looking for.
        </p>
        <Link to="/" className="btn btn-nexora px-4 py-2">Return Home</Link>
      </div>
    </div>
  );
}
