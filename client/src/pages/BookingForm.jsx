import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  bookingSchema,
  bookingTotalCents,
  AREAS,
  SERVICES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  BOOKING_DEFAULTS,
  LIMITS,
} from '@cleaningos/shared';
import { bookingApi, staffApi } from '../api/index.js';
import { useForm } from '../hooks/useForm.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney, localToday, statusLabel, paymentLabel } from '../utils/format.js';
import { Panel, Field, Notice, Loading, ErrorNotice, ConfirmDialog } from '../components/ui/index.jsx';
import StaffPicker from '../components/booking/StaffPicker.jsx';

const emptyBooking = () => ({
  customerName: '',
  phone: '',
  area: BOOKING_DEFAULTS.area,
  address: '',
  service: BOOKING_DEFAULTS.service,
  date: localToday(),
  time: BOOKING_DEFAULTS.time,
  hours: String(BOOKING_DEFAULTS.hours),
  cleanerCount: '0', // always = number of ticked cleaners
  rate: String(BOOKING_DEFAULTS.rate),
  cleanerIds: [],
  driverIds: [],
  status: BOOKING_DEFAULTS.status,
  paymentStatus: BOOKING_DEFAULTS.paymentStatus,
  notes: '',
});

const fromBooking = (b) => ({
  customerName: b.customerName,
  phone: b.phone,
  area: b.area,
  address: b.address || '',
  service: b.service,
  date: b.date,
  time: b.time,
  hours: String(b.hours),
  cleanerCount: String(b.cleanerCount),
  rate: String(b.rate),
  cleanerIds: b.cleaners.map((c) => c.id),
  driverIds: b.drivers.map((d) => d.id),
  status: b.status,
  paymentStatus: b.paymentStatus,
  notes: b.notes || '',
});

// Cleaner count is derived from the ticked cleaners, so the only UI rule is "at least one".
const cleanerCountCheck = (v) => (v.cleanerIds.length ? {} : { cleanerIds: 'Select at least one cleaner' });

export default function BookingForm() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm(bookingSchema, emptyBooking(), { extraCheck: cleanerCountCheck });
  const { values, setField, onChange, errors, formError, validate, applyServerError, reset } = form;

  const [staff, setStaff] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([staffApi.list(), editId ? bookingApi.get(editId) : Promise.resolve(null)])
      .then(([s, b]) => {
        if (cancelled) return;
        setStaff(s.items);
        setBooking(b);
        reset(b ? fromBooking(b) : emptyBooking());
      })
      .catch((e) => !cancelled && setLoadError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editId, reset]);

  // Active staff + any inactive staff already on this booking (so history stays visible).
  const assignedIds = useMemo(() => new Set([...(booking?.cleaners || []), ...(booking?.drivers || [])].map((s) => s.id)), [booking]);
  const cleaners = staff.filter((s) => s.role === 'CLEANER' && (s.active || assignedIds.has(s.id)));
  const drivers = staff.filter((s) => s.role === 'DRIVER' && (s.active || assignedIds.has(s.id)));

  const estimateCents = bookingTotalCents({
    cleanerCount: Number(values.cleanerCount) || 0,
    hours: Number(values.hours) || 0,
    rate: Number(values.rate) || 0,
  });

  const submit = async (e) => {
    e.preventDefault();
    setConflicts(null);
    const data = validate();
    if (!data) return;
    setSaving(true);
    try {
      const saved = editId ? await bookingApi.update(editId, data) : await bookingApi.create(data);
      toast(`Booking ${saved.code} saved`);
      navigate('/bookings');
    } catch (err) {
      applyServerError(err);
      if (err.code === 'SCHEDULE_CONFLICT') setConflicts(err.details || []);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await bookingApi.remove(editId);
      toast(`Booking ${booking.code} deleted`);
      navigate('/bookings');
    } catch (err) {
      toast(err.message, 'error');
      setConfirmDelete(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorNotice error={loadError} />;

  const text = (name, label, props = {}) => (
    <Field label={label} required={props.required} error={errors[name]}>
      {(fid, aria) => <input id={fid} {...aria} name={name} value={values[name]} onChange={onChange} {...props} />}
    </Field>
  );
  const select = (name, label, options, labelFn = (x) => x) => (
    <Field label={label} required error={errors[name]}>
      {(fid, aria) => (
        <select id={fid} {...aria} name={name} value={values[name]} onChange={onChange}>
          {options.map((o) => (
            <option key={o} value={o}>
              {labelFn(o)}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
  const textarea = (name, label, max, placeholder) => (
    <Field label={label} error={errors[name]}>
      {(fid, aria) => (
        <textarea id={fid} {...aria} name={name} rows={2} maxLength={max} placeholder={placeholder} value={values[name]} onChange={onChange} />
      )}
    </Field>
  );

  // Ticking cleaners sets the count (used for price and validated on the server).
  const setCleaners = (ids) => {
    setField('cleanerIds', ids);
    setField('cleanerCount', String(ids.length));
  };

  return (
    <Panel className="bf-panel">
      <form className="booking-form" onSubmit={submit} noValidate>
        <div className="bf-cols">
          {/* 1. Customer */}
          <div className="bf-section">
            <h3 className="bf-title">Customer</h3>
            {text('customerName', 'Customer name', { required: true, maxLength: LIMITS.nameMax, autoComplete: 'off' })}
            <div className="bf-row">
              {text('phone', 'Phone', { required: true, maxLength: 20, inputMode: 'tel', placeholder: '+971…' })}
              {select('area', 'Area', AREAS)}
            </div>
            {select('service', 'Service', SERVICES)}
            {textarea('address', 'Full address', LIMITS.addressMax, 'Building, flat no., street')}
          </div>

          {/* 2. Schedule & price */}
          <div className="bf-section">
            <h3 className="bf-title">Schedule &amp; price</h3>
            <div className="bf-row">
              {text('date', 'Date', { type: 'date', required: true })}
              {text('time', 'Time', { type: 'time', required: true })}
            </div>
            <div className="bf-row three">
              <Field label="Cleaners">
                {(fid) => (
                  <input
                    id={fid}
                    value={values.cleanerIds.length}
                    readOnly
                    tabIndex={-1}
                    className="readonly"
                    title="Set automatically from the cleaners ticked under Assign staff"
                  />
                )}
              </Field>
              {text('hours', 'Hours', { type: 'number', required: true, min: LIMITS.hoursMin, max: LIMITS.hoursMax, step: LIMITS.hoursStep })}
              {text('rate', 'Rate / hr', { type: 'number', required: true, min: LIMITS.rateMin, max: LIMITS.rateMax, step: 0.01 })}
            </div>
            <div className="estimate" title="Cleaners × hours × hourly rate (excludes other fees / tax)">
              <span>Estimated total</span>
              <strong>{formatMoney(estimateCents)}</strong>
            </div>
            <div className="bf-row">
              {select('status', 'Booking status', BOOKING_STATUSES, statusLabel)}
              {select('paymentStatus', 'Payment', PAYMENT_STATUSES, paymentLabel)}
            </div>
            {textarea('notes', 'Special instructions', LIMITS.notesMax, 'Access, pets, materials…')}
          </div>

          {/* 3. Staff */}
          <div className="bf-section bf-staff">
            <h3 className="bf-title">Assign staff</h3>
            <StaffPicker
              label="Cleaners"
              required
              staff={cleaners}
              value={values.cleanerIds}
              onChange={setCleaners}
              max={LIMITS.cleanerCountMax}
              height={150}
              searchable
              error={errors.cleanerIds}
              emptyText="No matching cleaners. Add cleaners from the Staff page."
            />
            <StaffPicker
              label="Drivers (optional)"
              staff={drivers}
              value={values.driverIds}
              onChange={(ids) => setField('driverIds', ids)}
              max={LIMITS.driversMax}
              height={78}
              chips={false}
              error={errors.driverIds}
              emptyText="No drivers. Add drivers from the Staff page."
            />
          </div>
        </div>

        {/* Footer: secondary info on the left, primary actions on the right */}
        <div className="bf-foot">
          {editId && (
            <>
              <button type="button" className="btn danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
                Delete
              </button>
              <span className="tag">{booking.code}</span>
            </>
          )}

          {formError && !conflicts?.length && <Notice type="error">{formError}</Notice>}
          {conflicts?.length > 0 && (
            <Notice>
              <b>Schedule conflict:</b>{' '}
              {conflicts.map((c) => `${c.staffName} is on ${c.bookingCode} at ${c.time}`).join(' • ')}
            </Notice>
          )}
          {!formError && !conflicts?.length && <span className="spacer" />}

          <div className="bf-actions">
            <button type="button" className="btn secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Save Booking'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete booking?"
        message={booking && `Booking ${booking.code} for ${booking.customerName} will be permanently deleted.`}
        confirmText="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </Panel>
  );
}
