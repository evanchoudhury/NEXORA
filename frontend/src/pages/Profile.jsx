import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useWeb3 } from '../context/Web3Context';
import { api } from '../services/api';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { account, isConnected, connectWallet, formatAddress } = useWeb3();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    api.getUserOrders()
      .then((res) => {
        if (res?.data?.orders) setOrders(res.data.orders);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="container py-5">
      {/* User Info Header Card */}
      <div className="p-4 p-md-5 rounded-4 shadow-sm mb-4" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
              alt={user.name}
              className="rounded-circle border p-1"
              style={{ width: '72px', height: '72px', objectFit: 'cover', borderColor: 'var(--surface-border)' }}
            />
            <div>
              <h3 className="text-dark fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)' }}>{user.name}</h3>
              <div className="text-secondary small">{user.email} • {user.phone || 'No phone added'}</div>
              <div className="d-flex gap-2 mt-2">
                {user.roles?.map((r) => (
                  <span key={r} className="badge bg-light text-dark border small fw-semibold" style={{ borderColor: 'var(--surface-border)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={connectWallet}
              className="btn btn-sm btn-outline-dark"
            >
              <i className="bi bi-wallet2 me-1"></i>
              {isConnected ? `Wallet: ${formatAddress(account)}` : 'Connect Web3 Wallet'}
            </button>
            <button onClick={logout} className="btn btn-sm btn-outline-danger">
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-3 border-bottom mb-4 pb-2" style={{ borderColor: 'var(--surface-border)' }}>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn btn-link text-decoration-none px-0 pb-2 ${activeTab === 'orders' ? 'text-dark fw-bold border-bottom border-dark border-2' : 'text-secondary'}`}
        >
          <i className="bi bi-bag me-2"></i> Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`btn btn-link text-decoration-none px-0 pb-2 ${activeTab === 'wishlist' ? 'text-dark fw-bold border-bottom border-dark border-2' : 'text-secondary'}`}
        >
          <i className="bi bi-heart me-2"></i> Wishlist ({wishlist.totalItems})
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="text-center py-5">
              <div className="spinner-border text-dark" role="status"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 p-4 rounded-4" style={{ background: '#FFFFFF', border: '1px dashed var(--surface-border)' }}>
              <i className="bi bi-bag fs-1 text-secondary d-block mb-2"></i>
              <h5 className="text-dark mb-2">No Orders Yet</h5>
              <p className="text-secondary small mb-3">When you place an order, tracking details and invoices will appear here.</p>
              <Link to="/products" className="btn btn-dark btn-sm px-3">Shop Catalog</Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-3 mb-3 border-bottom" style={{ borderColor: 'var(--surface-border)' }}>
                    <div>
                      <div className="text-dark font-monospace fw-bold fs-6">Order #{ord.order_number}</div>
                      <div className="text-muted small">Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge rounded-pill px-2.5 py-1 ${ord.payment_status === 'PAID' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning-emphasis border border-warning'}`}>
                        Payment: {ord.payment_status}
                      </span>
                      <span className="badge rounded-pill px-2.5 py-1 bg-light text-dark border">
                        Status: {ord.order_status}
                      </span>
                      <a
                        href={`http://localhost:5000/admin/invoices/${ord.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-dark"
                      >
                        <i className="bi bi-file-earmark-text"></i> Invoice
                      </a>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="d-flex flex-column gap-2 mb-3">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center text-secondary small">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="text-dark fw-semibold">₹{Number(item.total).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-secondary small">
                      Payment Method: <strong className="text-dark">{ord.payment_method}</strong>
                      {ord.tracking_number && <span className="ms-2">Tracking: <code>{ord.tracking_number}</code></span>}
                    </span>
                    <span className="text-dark fw-bold fs-6">Total: ₹{Number(ord.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.items.length === 0 ? (
            <div className="text-center py-5 p-4 rounded-4" style={{ background: '#FFFFFF', border: '1px dashed var(--surface-border)' }}>
              <i className="bi bi-heart fs-1 text-secondary d-block mb-2"></i>
              <h5 className="text-dark mb-2">Your Wishlist is Empty</h5>
              <p className="text-secondary small mb-3">Save items you love by tapping the heart icon on any product card.</p>
              <Link to="/products" className="btn btn-dark btn-sm px-3">Explore Products</Link>
            </div>
          ) : (
            <div className="product-grid-container">
              {wishlist.items.map((item) => (
                <div key={item.product_id} className="product-card p-3 shadow-sm rounded-3" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
                  <div className="product-image-wrap rounded-3 mb-2" style={{ background: '#F5F5F3', height: '220px' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h6 className="text-dark text-truncate mb-1">{item.name}</h6>
                  <div className="text-dark fw-bold mb-3">₹{Number(item.price).toLocaleString('en-IN')}</div>
                  <div className="d-flex gap-2 mt-auto">
                    <Link to={`/products/${item.slug || item.product_id}`} className="btn btn-sm btn-dark flex-grow-1">
                      View
                    </Link>
                    <button onClick={() => toggleWishlist(item.product_id)} className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
