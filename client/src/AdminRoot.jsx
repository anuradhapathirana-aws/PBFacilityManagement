import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/global.css';

export const ADMIN_BASE = '/admin';

/** Admin app (CleaningOS). All its routes live under /admin — links inside stay relative to the basename. */
export default function AdminRoot() {
  useEffect(() => {
    document.title = 'CleaningOS | Booking Manager';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#08121e');
  }, []);

  return (
    <BrowserRouter basename={ADMIN_BASE}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
