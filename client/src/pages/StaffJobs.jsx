import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { staffApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { roleLabel } from '../utils/format.js';
import { Panel, StatCard, StatGrid, Loading, ErrorNotice } from '../components/ui/index.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import BookingTable from '../components/booking/BookingTable.jsx';

// Replaces the prototype's "Cleaner View" and "Driver View" menus.
export default function StaffJobs() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, error, loading, reload } = useAsync(() => staffApi.bookings(id, { page, pageSize }), [id, page, pageSize]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNotice error={error} onRetry={reload} />;

  const { staff, items, total, stats } = data;

  return (
    <>
      <Panel
        title={`${staff.name} — ${roleLabel(staff.role)}${staff.active ? '' : ' (inactive)'}`}
        actions={
          <Link className="btn secondary" to="/staff">
            ‹ Back to Staff
          </Link>
        }
      >
        <StatGrid>
          <StatCard value={stats.assigned} label="Assigned bookings (non-cancelled)" />
          <StatCard value={stats.upcoming} label="Upcoming" />
          <StatCard value={stats.completed} label="Completed" />
          <StatCard value={stats.completedHours} label="Completed scheduled hours" />
        </StatGrid>
      </Panel>
      <Panel title={staff.role === 'DRIVER' ? 'Assigned trips (by booking)' : 'Assigned jobs'}>
        <ErrorNotice error={error} onRetry={reload} />
        <BookingTable items={items} empty="No bookings assigned yet." />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          label="bookings"
          onPage={setPage}
          onPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
        {staff.role === 'CLEANER' && (
          <p className="muted">Totals shown are full booking values, not this cleaner's share — see Reports for equal-share amounts.</p>
        )}
      </Panel>
    </>
  );
}
