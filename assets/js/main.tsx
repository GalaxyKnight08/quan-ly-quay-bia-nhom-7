import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthPage } from './auth.tsx';
import { DashboardPage } from './pos.tsx';
import { RouteGuard } from './route-guard.tsx';

const isDashboard = document.body.dataset.page === 'dashboard';
const page = isDashboard
  ? <RouteGuard><DashboardPage /></RouteGuard>
  : <RouteGuard guestOnly><AuthPage /></RouteGuard>;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Không tìm thấy phần tử #root.');

createRoot(rootElement).render(<StrictMode>{page}</StrictMode>);