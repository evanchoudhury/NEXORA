import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders({ limit: 15 })
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (ordersRes?.data?.orders) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isManager) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isManager, navigate]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-secondary small mt-2">Loading InsForge Telemetry...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="badge bg-dark text-white text-uppercase px-2.5 py-1 mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.68rem' }}>
            Administrative Console
          </span>
          <h1 className="display-6 fw-normal text-dark mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>
            Operations & Inventory Telemetry
          </h1>
        </div>

        <div className="d-flex gap-2">
          <a
            href="http://localhost:5000/admin/reports/sales"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-dark btn-sm px-3"
            style={{ fontSize: '0.825rem' }}
          >
            <i className="bi bi-file-earmark-bar-graph me-1"></i> Executive SSR Report
          </a>
          <button onClick={fetchDashboardData} className="btn btn-dark btn-sm px-3" style={{ fontSize: '0.825rem' }}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid mb-5">
        <div className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
          <div className="text-secondary small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.05em' }}>Total Paid Revenue</div>
          <div className="fs-2 fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#059669' }}>
            ₹{Number(stats.overview.totalRevenue).toLocaleString('en-IN')}
          </div>
          <div className="text-muted small mt-1">PostgreSQL live summation</div>
        </div>

        <div className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
          <div className="text-secondary small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.05em' }}>Total Orders</div>
          <div className="fs-2 fw-bold text-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            {stats.overview.totalOrders}
          </div>
          <div className="text-muted small mt-1">All processed transactions</div>
        </div>

        <div className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
          <div className="text-secondary small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.05em' }}>Registered Customers</div>
          <div className="fs-2 fw-bold text-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            {stats.overview.totalCustomers}
          </div>
          <div className="text-muted small mt-1">InsForge Auth Users</div>
        </div>

        <div className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
          <div className="text-secondary small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.05em' }}>Low Stock Alerts</div>
          <div className={`fs-2 fw-bold ${stats.overview.lowStockCount > 0 ? 'text-danger' : 'text-dark'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            {stats.overview.lowStockCount}
          </div>
          <div className="text-muted small mt-1">Items at or below threshold</div>
        </div>
      </div>

      {/* Critical Low Stock Warnings */}
      {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 && (
        <div className="p-4 rounded-4 shadow-sm mb-5" style={{ background: '#FFFFFF', border: '1px solid #FCD34D' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge rounded-circle p-2" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <i className="bi bi-exclamation-triangle-fill fs-6"></i>
            </span>
            <div>
              <h5 className="fw-semibold text-dark mb-0">Critical Inventory Replenishment Needed</h5>
              <div className="text-secondary small">Items reaching minimum warehouse threshold level</div>
            </div>
          </div>

          <div className="table-responsive rounded-3 border" style={{ borderColor: 'var(--surface-border)' }}>
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: '#F7F7F5' }}>
                <tr className="text-secondary small text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Current Stock</th>
                  <th className="py-3 text-end px-3">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockAlerts.map((it) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td className="px-3 py-3 text-dark fw-semibold">{it.name}</td>
                    <td className="text-secondary font-monospace small">{it.sku || 'NEX-CAT-00' + it.id}</td>
                    <td className="text-muted small">{it.category_name}</td>
                    <td>
                      <span className="badge rounded-pill px-2.5 py-1" style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 600 }}>
                        {it.stock} units
                      </span>
                    </td>
                    <td className="text-end px-3 text-secondary small font-monospace">{it.low_stock_threshold} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Management Table with Status Updater */}
      <div className="p-4 rounded-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-normal text-dark mb-0" style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem' }}>
              Order Management & Fulfillment
            </h5>
            <div className="text-secondary small">Live tracking, payment status and dispatch workflow</div>
          </div>
          <span className="badge bg-light text-dark border px-3 py-1.5" style={{ borderColor: 'var(--surface-border)', fontSize: '0.75rem' }}>
            Showing {orders.length} transactions
          </span>
        </div>

        <div className="table-responsive rounded-3 border" style={{ borderColor: 'var(--surface-border)' }}>
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: '#F7F7F5' }}>
              <tr className="text-secondary small text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Total</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Fulfillment Status</th>
                <th className="py-3 text-end px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td className="px-3 font-monospace text-dark fw-bold small">
                    {ord.order_number}
                  </td>
                  <td>
                    <div className="text-dark small fw-semibold">{ord.customer_name}</div>
                    <div className="text-muted small">{ord.customer_email}</div>
                  </td>
                  <td className="text-dark fw-bold small">
                    ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                      style={{
                        background: ord.payment_status === 'PAID' ? '#ECFDF5' : '#FFFBEB',
                        color: ord.payment_status === 'PAID' ? '#059669' : '#D97706',
                        border: `1px solid ${ord.payment_status === 'PAID' ? '#A7F3D0' : '#FDE68A'}`
                      }}
                    >
                      {ord.payment_status} ({ord.payment_method})
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{
                        width: '140px',
                        background: '#F7F7F5',
                        borderColor: 'var(--surface-border)',
                        color: '#171717',
                        fontWeight: 500,
                        fontSize: '0.78rem'
                      }}
                      value={ord.order_status}
                      disabled={updatingOrderId === ord.id}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="text-end px-3">
                    <a
                      href={`http://localhost:5000/admin/invoices/${ord.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-dark"
                      style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Print Tax Invoice"
                    >
                      <i className="bi bi-printer"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
