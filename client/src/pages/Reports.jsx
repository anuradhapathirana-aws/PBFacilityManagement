import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isRealDate } from '@cleaningos/shared';
import { reportApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney, formatDate, localToday, statusLabel } from '../utils/format.js';
import { Panel, Field, StatCard, StatGrid, Loading, ErrorNotice } from '../components/ui/index.jsx';
import BookingTable from '../components/booking/BookingTable.jsx';
import { IconButton } from '../components/ui/Icon.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { usePagination } from '../hooks/usePagination.js';

export default function Reports() {
  const [params, setParams] = useSearchParams();
  const date = isRealDate(params.get('date') || '') ? params.get('date') : localToday();
  const [cleanerId, setCleanerId] = useState('all');
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  const { data: r, error, loading, reload } = useAsync(() => reportApi.daily(date), [date]);

  const setDate = (d) => isRealDate(d) && setParams({ date: d }, { replace: true });

  const exportCsv = async () => {
    setExporting(true);
    try {
      await reportApi.dailyCsv(date);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const allocations = r ? r.allocations.filter((a) => cleanerId === 'all' || String(a.cleanerId) === cleanerId) : [];

  // Each table pages on screen; all rows still render with .pg-hidden so Print / Save PDF includes everything.
  const cleanerPg = usePagination(r?.cleaners, { resetKey: date });
  const allocPg = usePagination(allocations, { resetKey: `${date}|${cleanerId}` });
  const driverPg = usePagination(r?.drivers, { resetKey: date });
  const bookingPg = usePagination(r?.bookings, { resetKey: date });
  const hide = (pg, i) => (pg.isVisible(i) ? undefined : 'pg-hidden');

  return (
    <>
      <Panel
        title="Daily Operations & Final Report"
        actions={
          <>
            <button className="btn secondary" onClick={() => setDate(localToday())}>
              Today
            </button>
            <button className="btn secondary" onClick={() => window.print()} disabled={!r}>
              Print / Save PDF
            </button>
            <button className="btn" onClick={exportCsv} disabled={!r || exporting}>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </>
        }
      >
        <p className="muted">Choose a date to see bookings, cleaner workload, driver assignments and financial summaries.</p>
        <Field label="Report date" style={{ maxWidth: 320 }}>
          {(id) => <input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
        </Field>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !r && <Loading />}
        {r && (
          <StatGrid>
            <StatCard value={r.summary.total} label="Total bookings" />
            <StatCard value={r.summary.completed} label="Completed bookings" />
            <StatCard value={r.summary.statusCounts.PENDING} label="Pending" />
            <StatCard value={r.summary.statusCounts.CANCELLED} label="Cancelled" />
            <StatCard value={formatMoney(r.summary.bookedCents)} label="Non-cancelled booked value" />
            <StatCard value={formatMoney(r.summary.completedCents)} label="Completed job value" />
            <StatCard value={formatMoney(r.summary.paidCents)} label="Bookings marked Paid" />
            <StatCard value={formatMoney(r.summary.unpaidCents)} label="Bookings marked Unpaid" />
          </StatGrid>
        )}
      </Panel>

      {r && (
        <>
          <Panel title="Cleaner-wise Work Report — Equal Share">
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Cleaner</th>
                    <th>Assigned jobs</th>
                    <th>Completed jobs</th>
                    <th>Completed job hours</th>
                    <th>Assigned value</th>
                    <th>Completed value</th>
                    <th className="no-print actions-col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {r.cleaners.map((c, i) => (
                    <tr key={c.id} className={hide(cleanerPg, i)}>
                      <td>{c.name}</td>
                      <td>{c.assigned}</td>
                      <td>{c.completed}</td>
                      <td>{c.completedHours}</td>
                      <td>{formatMoney(c.assignedCents)}</td>
                      <td>{formatMoney(c.completedCents)}</td>
                      <td className="no-print actions-col">
                        <IconButton
                          icon="eye"
                          title={`Show ${c.name}'s jobs & share below`}
                          onClick={() => {
                            setCleanerId(String(c.id));
                            document.getElementById('cleaner-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...cleanerPg.pagerProps} label="cleaners" />
            <p className="muted">
              A booking assigned to three cleaners counts as one job for each cleaner. Hours use scheduled booking duration. Per-cleaner amounts are an
              equal share of the booking total, with cent rounding reconciled so shares add up to the total. These are not wages.
            </p>
          </Panel>

          <div id="cleaner-details" />
          <Panel
            title="Individual Cleaner Job & Amount Details"
            actions={
              <select className="search" value={cleanerId} onChange={(e) => setCleanerId(e.target.value)} aria-label="Choose cleaner">
                <option value="all">All cleaners</option>
                {r.cleaners.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            }
          >
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Cleaner</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Full booking</th>
                    <th>Cleaner share</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.length ? (
                    allocations.map((a, i) => (
                      <tr key={`${a.bookingId}-${a.cleanerId}`} className={hide(allocPg, i)}>
                        <td>{a.cleanerName}</td>
                        <td>{a.bookingCode}</td>
                        <td>{a.customerName}</td>
                        <td>{statusLabel(a.status)}</td>
                        <td>{a.hours}</td>
                        <td>{formatMoney(a.totalCents)}</td>
                        <td>{formatMoney(a.shareCents)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>No jobs for this selection on {formatDate(date)}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...allocPg.pagerProps} label="allocations" />
          </Panel>

          <Panel title="Driver-wise Assignment Report">
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Assigned bookings</th>
                    <th>Bookings completed</th>
                  </tr>
                </thead>
                <tbody>
                  {r.drivers.map((d, i) => (
                    <tr key={d.id} className={hide(driverPg, i)}>
                      <td>{d.name}</td>
                      <td>{d.assigned}</td>
                      <td>{d.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...driverPg.pagerProps} label="drivers" />
            <p className="muted">These are booking-based driver assignments, not verified trips.</p>
          </Panel>

          <Panel title="Payments & Booking Status">
            <p>
              Partial-payment bookings: <b>{r.summary.partialCount}</b> (full booking value {formatMoney(r.summary.partialCents)}; received amount not
              recorded).
            </p>
            <p>
              Confirmed: <b>{r.summary.statusCounts.CONFIRMED}</b> • Assigned: <b>{r.summary.statusCounts.ASSIGNED}</b> • On the Way:{' '}
              <b>{r.summary.statusCounts.ON_THE_WAY}</b> • In Progress: <b>{r.summary.statusCounts.IN_PROGRESS}</b>
            </p>
            <p className="muted">Revenue values are estimates from booking price and status, not verified cash receipts.</p>
          </Panel>

          <Panel title={`Bookings on ${formatDate(date)}`}>
            <BookingTable items={r.bookings} isVisible={bookingPg.isVisible} empty="No bookings on this date." />
            <Pagination {...bookingPg.pagerProps} label="bookings" />
          </Panel>
        </>
      )}
    </>
  );
}
