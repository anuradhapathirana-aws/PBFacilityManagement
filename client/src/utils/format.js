import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, STAFF_ROLE_LABELS } from '@cleaningos/shared';

export { formatMoney } from '@cleaningos/shared';

export const statusLabel = (s) => BOOKING_STATUS_LABELS[s] || s;
export const paymentLabel = (s) => PAYMENT_STATUS_LABELS[s] || s;
export const roleLabel = (s) => STAFF_ROLE_LABELS[s] || s;

/** "2026-11-07" + "09:00" → "7 Nov 2026, 09:00" */
export const formatDateTime = (date, time) => {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${dt.toLocaleDateString('en-GB', { dateStyle: 'medium' })}, ${time}`;
};

export const formatDate = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

/** Today in the browser's local timezone as YYYY-MM-DD. */
export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
