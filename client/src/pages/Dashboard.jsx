import { Link } from 'react-router-dom';
import { reportApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatMoney } from '../utils/format.js';
import { Panel, StatCard, StatGrid, Loading, ErrorNotice } from '../components/ui/index.jsx';
import BookingTable from '../components/booking/BookingTable.jsx';

export default function Dashboard() {
  const { data, error, loading, reload } = useAsync(() => reportApi.dashboard(), []);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorNotice error={error} onRetry={reload} />;

  return (
    <>
      <StatGrid style={{ marginTop: 18 }}>
        <StatCard value={data.total} label="Total bookings" />
        <StatCard value={data.todayCount} label="Today's bookings (non-cancelled)" />
        <StatCard value={data.pending} label="Pending" />
        <StatCard value={formatMoney(data.paidCents)} label="Recorded paid revenue" />
      </StatGrid>
      <Panel
        title="Upcoming / Recent Bookings"
        actions={
          <Link className="btn secondary" to={`/bookings?date=${data.today}`}>
            View Today
          </Link>
        }
      >
        <BookingTable items={data.recent} empty="No bookings yet. Create your first booking." />
      </Panel>
      <Panel title="How to use">
        <p className="muted">
          Add staff → create booking → tick the required number of cleaners → optionally assign a driver → save → update status and payment with the
          edit (pencil) icon. Hover any icon to see what it does.
        </p>
      </Panel>
    </>
  );
}
