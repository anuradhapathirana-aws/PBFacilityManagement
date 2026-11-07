import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { admin, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="auth-wrap muted">Loading…</div>;
  if (!admin) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
