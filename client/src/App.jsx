import { Link, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Bookings from './pages/Bookings.jsx';
import BookingForm from './pages/BookingForm.jsx';
import Staff from './pages/Staff.jsx';
import StaffJobs from './pages/StaffJobs.jsx';
import Reports from './pages/Reports.jsx';

const NotFound = () => (
  <div className="panel">
    <h2>Page not found</h2>
    <Link className="btn secondary" to="/">
      Go to Dashboard
    </Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<BookingForm key="new" />} />
          <Route path="bookings/:id" element={<BookingForm />} />
          <Route path="staff" element={<Staff />} />
          <Route path="staff/:id/jobs" element={<StaffJobs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
