import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api.getOrder(orderId)
        .then((res) => {
          if (res?.data?.order) setOrder(res.data.order);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  return (
    <div className="container py-5 text-center">
      <div className="p-5 rounded-4 mx-auto shadow-sm" style={{ maxWidth: '640px', background: '#FFFFFF', border: '1px solid var(--surface-border)' }}>
        <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4" style={{ width: '70px', height: '70px', background: '#F2F9F6', color: '#10B981' }}>
          <i className="bi bi-check2 display-5"></i>
        </div>

        <h2 className="fw-normal text-dark mb-2" style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.2rem' }}>Order Confirmed</h2>
        <p className="text-secondary small mb-4">
          Thank you for choosing NEXORA. Your order has been securely recorded and is being prepared for express dispatch.
        </p>

        {order && (
          <div className="p-3 rounded-3 text-start mb-4 small" style={{ background: '#F7F7F5', border: '1px solid var(--surface-border)' }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Order Reference:</span>
              <span className="text-primary font-monospace fw-bold">{order.order_number}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Total Amount:</span>
              <span className="text-dark fw-bold">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Payment Method:</span>
              <span className="text-dark fw-medium">{order.payment_method}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-secondary">Payment Status:</span>
              <span className="badge bg-success">{order.payment_status}</span>
            </div>

            {order.blockchain_transaction && (
              <div className="mt-3 pt-2 border-top border-secondary">
                <span className="text-warning fw-bold d-block mb-1">Web3 On-Chain Verification:</span>
                <div className="text-secondary font-monospace text-truncate">
                  Tx: {order.blockchain_transaction.transaction_hash}
                </div>
                <div className="text-secondary">
                  Network: {order.blockchain_transaction.network.toUpperCase()} | Block #{order.blockchain_transaction.block_number}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {order && (
            <a
              href={`http://localhost:5000/admin/invoices/${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light px-4"
            >
              <i className="bi bi-file-earmark-pdf me-2"></i> View EJS Tax Invoice
            </a>
          )}
          <Link to="/products" className="btn btn-nexora px-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
