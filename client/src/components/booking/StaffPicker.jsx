import { useMemo, useState } from 'react';

/**
 * Compact searchable multi-select checklist (layout from the prototype, tightened for the booking form).
 * staff: [{ id, name, phone, active }]; value: number[]; onChange(number[])
 * max: optional cap — further boxes disable once reached.
 * height: list height in px. searchable: defaults to true when more than 6 staff.
 * chips: show removable chips for the current selection.
 */
export default function StaffPicker({
  label,
  required,
  staff,
  value,
  onChange,
  error,
  max,
  height = 160,
  searchable = staff.length > 6,
  chips = true,
  emptyText = 'No matching staff.',
}) {
  const [search, setSearch] = useState('');
  const byId = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);
  const filtered = staff.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()));
  const full = max !== undefined && value.length >= max;

  const toggle = (id, checked) => onChange(checked ? [...new Set([...value, id])] : value.filter((x) => x !== id));

  return (
    <div className="picker">
      <div className="picker-head">
        <span className="picker-label">
          {label} {required && <span className="req">*</span>}
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="picker-count" title={max !== undefined ? `Up to ${max} can be selected` : undefined}>
            {value.length} selected{full ? ' (max)' : ''}
          </span>
          <button type="button" className="btn secondary xs" onClick={() => onChange([])} disabled={!value.length}>
            Clear
          </button>
        </span>
      </div>

      {searchable && (
        <input
          className="search picker-search"
          placeholder="Search name…"
          aria-label={`Search ${label}`}
          value={search}
          maxLength={100}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className={`scrollstaff ${error ? 'invalid' : ''}`} style={{ height }} role="group" aria-label={label}>
        {filtered.length ? (
          filtered.map((s) => {
            const checked = value.includes(s.id);
            const disabled = !checked && full;
            return (
              <label key={s.id} className={`staffitem ${disabled ? 'disabled' : ''}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => toggle(s.id, e.target.checked)} />
                <span>{s.name}</span>
                {!s.active && <span className="tag inactive">Inactive</span>}
                <small style={{ marginLeft: 'auto' }}>{s.phone}</small>
              </label>
            );
          })
        ) : (
          <p className="muted" style={{ margin: 8 }}>
            {emptyText}
          </p>
        )}
      </div>

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}

      {chips && value.length > 0 && (
        <div className="chips">
          {value.map((id) => (
            <span className="chip" key={id}>
              {byId.get(id)?.name || `#${id}`}
              <button type="button" aria-label={`Remove ${byId.get(id)?.name}`} onClick={() => toggle(id, false)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
