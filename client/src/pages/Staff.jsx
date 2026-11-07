import { useMemo, useState } from 'react';
import { staffSchema, STAFF_ROLES, LIMITS } from '@cleaningos/shared';
import { staffApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { useForm } from '../hooks/useForm.js';
import { usePagination } from '../hooks/usePagination.js';
import { useToast } from '../context/ToastContext.jsx';
import { roleLabel } from '../utils/format.js';
import { Panel, Field, Notice, Loading, ErrorNotice, ConfirmDialog } from '../components/ui/index.jsx';
import { IconButton } from '../components/ui/Icon.jsx';
import Pagination from '../components/ui/Pagination.jsx';

const blank = { name: '', phone: '', role: 'CLEANER', active: true };

export default function Staff() {
  const toast = useToast();
  const { data, error, loading, reload } = useAsync(() => staffApi.list(), []);
  const { values, onChange, errors, formError, validate, applyServerError, reset } = useForm(staffSchema, blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const all = data?.items || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((s) => (!roleFilter || s.role === roleFilter) && (!q || s.name.toLowerCase().includes(q) || (s.phone || '').includes(q)));
  }, [all, roleFilter, search]);
  const { pageItems, pagerProps } = usePagination(filtered, { resetKey: `${roleFilter}|${search}` });
  const countOf = (role) => all.filter((s) => s.role === role && s.active).length;

  const startEdit = (s) => {
    setEditing(s);
    reset({ name: s.name, phone: s.phone || '', role: s.role, active: s.active });
  };
  const cancelEdit = () => {
    setEditing(null);
    reset(blank);
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = validate();
    if (!body) return;
    setSaving(true);
    try {
      if (editing) {
        await staffApi.update(editing.id, body);
        toast(`${body.name} updated`);
      } else {
        await staffApi.create(body);
        toast(`${body.name} added as ${roleLabel(body.role)}`);
      }
      cancelEdit();
      reload();
    } catch (err) {
      applyServerError(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await staffApi.update(s.id, { name: s.name, phone: s.phone, role: s.role, active: !s.active });
      toast(`${s.name} ${s.active ? 'deactivated' : 'reactivated'}`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await staffApi.remove(toDelete.id);
      toast(`${toDelete.name} removed`);
      if (editing?.id === toDelete.id) cancelEdit();
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setToDelete(null);
    }
  };

  const roleLocked = !!editing?.assignmentCount;

  return (
    <div className="staff-layout">
      {/* Left: add / edit form */}
      <Panel title={editing ? `Edit ${editing.name}` : 'Add Staff Member'}>
        <form className="compact-form" onSubmit={submit} noValidate>
          <Field label="Full name" required error={errors.name}>
            {(id, aria) => <input id={id} {...aria} name="name" maxLength={LIMITS.nameMax} placeholder="e.g. Nimal Perera" value={values.name} onChange={onChange} />}
          </Field>
          <Field label="Phone" error={errors.phone}>
            {(id, aria) => <input id={id} {...aria} name="phone" maxLength={20} inputMode="tel" placeholder="+971…" value={values.phone} onChange={onChange} />}
          </Field>
          <Field label="Role" required error={errors.role} hint={roleLocked ? 'Locked — this person has bookings' : undefined}>
            {(id, aria) => (
              <select id={id} {...aria} name="role" value={values.role} onChange={onChange} disabled={roleLocked}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Notice type="error">{formError}</Notice>
          <div className="staff-form-actions">
            {editing && (
              <button className="btn secondary" type="button" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : '+ Add Staff'}
            </button>
          </div>
        </form>
      </Panel>

      {/* Right: directory */}
      <Panel
        title={`Staff Directory (${all.length})`}
        actions={
          <div className="staff-tools">
            <input className="search" placeholder="Search name or phone" aria-label="Search staff" maxLength={LIMITS.searchMax} value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="search" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
              <option value="">All roles</option>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}s
                </option>
              ))}
            </select>
          </div>
        }
      >
        {data && (
          <p className="muted" style={{ margin: '-4px 0 8px', fontSize: 13 }}>
            {countOf('CLEANER')} active cleaners • {countOf('DRIVER')} active drivers
          </p>
        )}
        <ErrorNotice error={error} onRetry={reload} />
        {loading && !data ? (
          <Loading />
        ) : filtered.length ? (
          <>
            <div className="tablewrap">
              <table className="table-compact">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Bookings</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr key={s.id} style={editing?.id === s.id ? { background: 'var(--card)' } : undefined}>
                      <td>
                        <b>{s.name}</b>
                      </td>
                      <td>
                        <span className={`tag role-tag ${s.role === 'DRIVER' ? 'driver' : ''}`}>{roleLabel(s.role)}</span>
                      </td>
                      <td>{s.phone || <span className="muted">—</span>}</td>
                      <td>{s.active ? <span className="good">● Active</span> : <span className="tag inactive">Inactive</span>}</td>
                      <td>{s.assignmentCount}</td>
                      <td className="actions-col">
                        <div className="actions">
                          <IconButton icon="jobs" title={`View ${s.name}'s jobs`} to={`/staff/${s.id}/jobs`} />
                          <IconButton icon="edit" title={`Edit ${s.name}`} onClick={() => startEdit(s)} />
                          <IconButton
                            icon={s.active ? 'userOff' : 'userOn'}
                            variant={s.active ? '' : 'good'}
                            title={s.active ? `Deactivate ${s.name}` : `Reactivate ${s.name}`}
                            onClick={() => toggleActive(s)}
                          />
                          <IconButton
                            icon="trash"
                            variant="danger"
                            title={s.assignmentCount ? 'Cannot remove: has booking history (deactivate instead)' : `Remove ${s.name}`}
                            disabled={s.assignmentCount > 0}
                            onClick={() => setToDelete(s)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagerProps} label="staff" />
          </>
        ) : (
          <p className="muted">{all.length ? 'No staff match this search.' : 'No staff yet. Add your first cleaner or driver.'}</p>
        )}
      </Panel>

      <ConfirmDialog
        open={!!toDelete}
        title="Remove staff member?"
        message={toDelete && `${toDelete.name} will be permanently removed.`}
        confirmText="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
