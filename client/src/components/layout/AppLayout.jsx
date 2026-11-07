import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// The ONLY side-nav menus. Do not add entries that duplicate an existing page (see CLAUDE.md).
export const MENUS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/bookings', label: 'Bookings' },
  { to: '/staff', label: 'Staff' },
  { to: '/reports', label: 'Reports' },
];

const TITLES = [
  [/^\/bookings\/new$/, 'New Booking', 'Create a customer booking and assign staff'],
  [/^\/bookings\/\d+$/, 'Manage Booking', 'Update booking details, staff, status and payment'],
  [/^\/bookings/, 'Bookings', 'Find bookings by date, customer, status or payment'],
  [/^\/staff\/\d+\/jobs$/, 'Staff Jobs', 'Bookings assigned to this staff member'],
  [/^\/staff/, 'Staff', 'Cleaners and drivers'],
  [/^\/reports/, 'Reports', 'Daily operations and financial summary'],
  [/^\/$/, 'Dashboard', 'Cleaning company operations'],
];

export default function AppLayout() {
  const { admin, logout } = useAuth();
  const { pathname } = useLocation();
  const [, title, subtitle] = TITLES.find(([re]) => re.test(pathname)) || [null, 'CleaningOS', ''];

  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">✦ CleaningOS</div>
        <nav className="navbox" aria-label="Main">
          {MENUS.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who muted">Signed in as {admin?.name}</div>
          <button className="btn secondary small" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="top">
          <div>
            <h1>{title}</h1>
            <div className="muted">{subtitle}</div>
          </div>
          {pathname !== '/bookings/new' && (
            <Link className="btn" to="/bookings/new">
              + New Booking
            </Link>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
