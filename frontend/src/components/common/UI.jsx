import React from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';

export const Spinner = ({ size = 32, className = '' }) => (
  <div className="loading-spinner" style={{ width: size, height: size }} />
);

export const LoadingPage = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
    <Spinner size={40} />
  </div>
);

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  if (!open) return null;
  const widths = { sm: 420, md: 560, lg: 720, xl: 900 };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: widths[size] }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm Action', message, danger = false, loading = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={16} /> : 'Confirm'}
        </button>
      </>
    }
  >
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <AlertTriangle size={22} color={danger ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
    </div>
  </Modal>
);

const STATUS_MAP = {
  PENDING: 'badge-yellow', MANAGER_APPROVED: 'badge-blue', MANAGER_REJECTED: 'badge-red',
  HR_APPROVED: 'badge-green', HR_REJECTED: 'badge-red', CANCELLED: 'badge-gray',
  AVAILABLE: 'badge-green', ALLOCATED: 'badge-blue', UNDER_MAINTENANCE: 'badge-yellow', RETIRED: 'badge-gray',
  ACTIVE: 'badge-green', INACTIVE: 'badge-red',
  ADMIN: 'badge-blue', HR: 'badge-cyan', MANAGER: 'badge-purple', EMPLOYEE: 'badge-green', SUPER_ADMIN: 'badge-orange',
  ANNUAL: 'badge-blue', SICK: 'badge-red', CASUAL: 'badge-yellow', MATERNITY: 'badge-purple',
  PATERNITY: 'badge-cyan', UNPAID: 'badge-gray', COMPENSATORY: 'badge-orange',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_MAP[status] || 'badge-gray'}`}>
    {status?.replace(/_/g, ' ')}
  </span>
);

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Showing {start}–{end} of {total} records
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrev} onClick={() => onPageChange(page - 1)}>← Prev</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5) {
            if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
          }
          return (
            <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onPageChange(p)}>{p}</button>
          );
        })}
        <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNext} onClick={() => onPageChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Search...', style }) => (
  <div className="search-input-wrapper" style={style}>
    <Search size={16} />
    <input className="form-input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ width: 260 }} />
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="empty-state">
    {Icon && <Icon size={48} style={{ opacity: 0.25, marginBottom: 12 }} />}
    <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{title}</h3>
    <p style={{ margin: '0 0 16px', fontSize: 14 }}>{message}</p>
    {action}
  </div>
);

export const Avatar = ({ src, name = '', size = 36 }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#1e40af', '#0891b2', '#7c3aed', '#16a34a', '#d97706', '#dc2626'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  if (src) return <img src={src} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return (
    <div className="avatar-placeholder" style={{ width: size, height: size, background: bg, color: '#fff', fontSize: Math.max(11, size * 0.35) }}>
      {initials || '?'}
    </div>
  );
};

export const FormGroup = ({ label, required, error, hint, children }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}{required && <span>*</span>}</label>}
    {children}
    {error && <div className="form-error">{error}</div>}
    {hint && !error && <div className="form-hint">{hint}</div>}
  </div>
);

export const Card = ({ title, subtitle, actions, children, style, noPad }) => (
  <div className="card" style={style}>
    {(title || actions) && (
      <div className="card-header">
        <div>
          {title && <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>}
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    )}
    {noPad ? children : <div className="card-body">{children}</div>}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, color, sub, trend }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={22} color={color} />
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
  </div>
);
