import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

// One build, two apps:
//   /admin, /admin/*  → CleaningOS admin (login, bookings, staff, reports)
//   everything else   → public landing page
// Each is a separate lazy chunk, so visitors never download the admin code.
const path = window.location.pathname;
const isAdmin = path === '/admin' || path.startsWith('/admin/');
const Root = isAdmin ? lazy(() => import('./AdminRoot.jsx')) : lazy(() => import('./landing/Landing.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </React.StrictMode>
);
