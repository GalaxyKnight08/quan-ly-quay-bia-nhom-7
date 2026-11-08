import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthPage } from './auth.jsx';
import { DashboardPage } from './dashboard.jsx';
import { RouteGuard } from './route-guard.jsx';

const isDashboard = document.body.dataset.page === 'dashboard';
const page = isDashboard
  ? <RouteGuard><DashboardPage /></RouteGuard>
  : <RouteGuard guestOnly><AuthPage /></RouteGuard>;

createRoot(document.getElementById('root')).render(<StrictMode>{page}</StrictMode>);