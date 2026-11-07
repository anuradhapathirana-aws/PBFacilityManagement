import { formatMoney, formatDateTime } from '../../utils/format.js';
import { StatusTag, PaymentTag } from '../ui/index.jsx';
import { IconButton } from '../ui/Icon.jsx';

// isVisible(i): optional — rows where it returns false get .pg-hidden (hidden on screen, still printed).
export default function BookingTable({ items, onDelete, isVisible, empty = 'No bookings found.' }) {
  if (!items?.length) return <p className="muted">{empty}</p>;
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Booking</th>
            <th>Customer</th>
            <th>Date / Area</th>
            <th>Cleaners</th>
            <th>Driver</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th className="no-print actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b, i) => (
            <tr key={b.id} className={isVisible && !isVisible(i) ? 'pg-hidden' : undefined}>
              <td>{b.code}</td>
              <td>
                <b>{b.customerName}</b>
                <br />
                <small>{b.phone}</small>
              </td>
              <td>
                {formatDateTime(b.date, b.time)}
                <br />
                <small>
                  {b.area} • {b.hours}h
                </small>
              </td>
              <td>{b.cleaners.length ? b.cleaners.map((c) => c.name).join(', ') : <span className="bad">Unassigned</span>}</td>
              <td>{b.drivers.length ? b.drivers.map((d) => d.name).join(', ') : <span className="muted">—</span>}</td>
              <td>{formatMoney(b.totalCents)}</td>
              <td>
                <StatusTag status={b.status} />
              </td>
              <td>
                <PaymentTag status={b.paymentStatus} />
              </td>
              <td className="no-print actions-col">
                <div className="actions">
                  <IconButton icon="edit" title={`Manage booking ${b.code}`} to={`/bookings/${b.id}`} />
                  {onDelete && <IconButton icon="trash" variant="danger" title={`Delete booking ${b.code}`} onClick={() => onDelete(b)} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
