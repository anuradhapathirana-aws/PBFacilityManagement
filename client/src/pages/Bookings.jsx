import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BOOKING_STATUSES, PAYMENT_STATUSES, isRealDate, LIMITS } from '@cleaningos/shared';
import { bookingApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney, formatDate, localToday, statusLabel, paymentLabel } from '../utils/format.js';
import { Panel, Field, StatCard, StatGrid, Loading, ErrorNotice, ConfirmDialog } from '../components/ui/index.jsx';
import BookingTable from '../components/booking/BookingTable.jsx';
import Pagination, { PAGE_SIZES } from '../components/ui/Pagination.jsx';

// Replaces the prototype's separate "Daily Bookings" and "Payments" menus: date / status / payment are filters here.
export default function Bookings() {
  const [params, setParams] = useSearchParams();
  const date = isRealDate(params.get('date') || '') ? params.get('date') : '';
  const status = BOOKING_STATUSES.includes(params.get('status')) ? params.get('status') : '';
  const paymentStatus = PAYMENT_STATUSES.includes(params.get('payment')) ? params.get('payment') : '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = PAGE_SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : 10;
  const [q, setQ] = useState(params.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if ((params.get('q') || '') !== debouncedQ) setParam('q', debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const { data, error, loading, reload } = useAsync(
    () => bookingApi.list({ date, q: debouncedQ, status, paymentStatus, page, pageSize }),
    [date, debouncedQ, status, paymentStatus, page, pageSize]
  );

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await bookingApi.remove(toDelete.id);
      toast(`Booking ${toDelete.code} deleted`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const items = data?.items || [];
  const summary = data?.summary;

  // After deleting the last row on the last page, step back a page.
  useEffect(() => {
    if (data && !data.items.length && data.total > 0 && page > 1) setParam('page', String(Math.ceil(data.total / pageSize)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Panel>
        <div className="filters">
          <Field label="Booking date">
            {(id) => (
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input id={id} type="date" value={date} onChange={(e) => setParam('date', isRealDate(e.target.value) ? e.target.value : '')} />
                <button type="button" className="btn secondary small" onClick={() => setParam('date', localToday())}>
                  Today
                </button>
              </div>
            )}
          </Field>
          <Field label="Search">
            {(id) => (
              <input id={id} className="search" placeholder="Customer, phone, booking or area" maxLength={LIMITS.searchMax} value={q} onChange={(e) => setQ(e.target.value)} />
            )}
          </Field>
          <Field label="Status">
            {(id) => (
              <select id={id} value={status} onChange={(e) => setParam('status', e.target.value)}>
                <option value="">All statuses</option>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Payment">
            {(id) => (
              <select id={id} value={paymentStatus} onChange={(e) => setParam('payment', e.target.value)}>
                <option value="">All payments</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {paymentLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        {(date || q || status || paymentStatus) && (
          <button
            className="btn secondary small"
            style={{ marginTop: 12 }}
            onClick={() => {
              setQ('');
              setParams({}, { replace: true });
            }}
          >
            Clear filters
          </button>
        )}
      </Panel>

      {date && summary && (
        <StatGrid>
          <StatCard value={summary.total} label="Bookings on selected date" />
          <StatCard value={summary.active} label="Non-cancelled bookings" />
          <StatCard value={summary.cleanerAssignments} label="Cleaner assignments" />
          <StatCard value={formatMoney(summary.valueCents)} label="Scheduled booking value" />
        </StatGrid>
      )}

      <Panel title={date ? `Bookings — ${formatDate(date)}` : 'All Customer Bookings'}>
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? <Loading /> : <BookingTable items={items} onDelete={setToDelete} empty="No bookings match these filters." />}
        {data && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            label="bookings"
            onPage={(p) => setParam('page', p > 1 ? String(p) : '')}
            onPageSize={(s) => setParam('size', s === 10 ? '' : String(s))}
          />
        )}
      </Panel>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete booking?"
        message={toDelete && `Booking ${toDelete.code} for ${toDelete.customerName} will be permanently deleted.`}
        confirmText="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
