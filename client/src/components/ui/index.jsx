// Reusable UI primitives. They only apply classes from styles/global.css — keep visuals there.
import { useEffect, useId } from 'react';
import { statusLabel, paymentLabel } from '../../utils/format.js';

export const Panel = ({ title, actions, children, className = '' }) => (
  <section className={`panel ${className}`}>
    {(title || actions) && (
      <div className="spread">
        {title && <h2>{title}</h2>}
        {actions && <div className="row">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

export const StatCard = ({ value, label, children, style }) => (
  <div className="stat" style={style}>
    {children ?? <strong>{value}</strong>}
    <span>{label}</span>
  </div>
);

export const StatGrid = ({ children, style }) => (
  <div className="cards" style={style}>
    {children}
  </div>
);

/**
 * Field wrapper: label + control + inline error.
 * Pass a render function to get the generated id: <Field label="Name">{(id) => <input id={id} />}</Field>
 */
export function Field({ label, required, error, hint, children, style, className = '' }) {
  const id = useId();
  return (
    <div className={`field ${error ? 'invalid' : ''} ${className}`} style={style}>
      {label && (
        <label htmlFor={id}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id, { 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-err` : undefined }) : children}
      {hint && !error && <small>{hint}</small>}
      {error && (
        <span className="field-error" id={`${id}-err`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export const Notice = ({ type = '', children }) => (children ? <div className={`notice ${type}`}>{children}</div> : null);

export const Loading = ({ text = 'Loading…' }) => <p className="muted">{text}</p>;

export const ErrorNotice = ({ error, onRetry }) =>
  error ? (
    <div className="notice error">
      {error.message || 'Something went wrong'}{' '}
      {onRetry && (
        <button className="btn secondary small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  ) : null;

export const StatusTag = ({ status }) => (
  <span className={`tag ${status === 'CANCELLED' ? 'cancelled' : status === 'COMPLETED' ? 'completed' : ''}`}>{statusLabel(status)}</span>
);

export const PaymentTag = ({ status }) => <span className="tag">{paymentLabel(status)}</span>;

export function ConfirmDialog({ open, title, message, confirmText = 'Confirm', danger, busy, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="muted">{message}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
