import React from 'react';
import { Link } from 'react-router-dom';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom" style={{ borderColor: 'var(--surface-border)' }}>
      {/* Product Image */}
      <Link to={`/products/${item.slug || item.product_id}`} className="rounded-1 overflow-hidden flex-shrink-0" style={{ width: '80px', height: '96px', background: '#F5F5F3' }}>
        <img
          src={item.image_url}
          alt={item.name}
          className="w-100 h-100 object-fit-cover"
        />
      </Link>

      {/* Title & SKU */}
      <div className="flex-grow-1 min-w-0">
        <Link to={`/products/${item.slug || item.product_id}`} className="text-decoration-none">
          <h6 className="text-dark text-truncate mb-1 fw-medium">{item.name}</h6>
        </Link>
        <div className="text-muted small">Ref: {item.sku}</div>
        <div className="text-secondary small mt-1">
          ₹{Number(item.price).toLocaleString('en-IN')} each
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="d-flex align-items-center border rounded-1 px-2 py-1 flex-shrink-0 bg-white" style={{ borderColor: 'var(--surface-border)' }}>
        <button
          onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
          className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <i className="bi bi-dash"></i>
        </button>
        <span className="text-dark fw-bold px-3 small">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
          className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
          disabled={item.quantity >= item.stock}
          aria-label="Increase quantity"
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>

      {/* Line Total */}
      <div className="text-end flex-shrink-0" style={{ width: '110px' }}>
        <div className="fw-bold text-dark fs-6">
          ₹{Number(item.item_total).toLocaleString('en-IN')}
        </div>
        <button
          onClick={() => onRemove(item.item_id)}
          className="btn btn-sm btn-link text-muted hover-dark p-0 mt-1 text-decoration-none small"
          aria-label="Remove item from bag"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
