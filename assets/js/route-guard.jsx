import { useEffect } from 'react';
import { authService } from '../services/auth-service.js';

export function RouteGuard({ children, guestOnly = false }) {
  const user = authService.currentUser();
  const shouldRedirect = guestOnly ? Boolean(user) : !user;

  useEffect(() => {
    if (shouldRedirect) {
      window.location.replace(guestOnly ? './dashboard.html' : './index.html');
    }
  }, [guestOnly, shouldRedirect]);

  return shouldRedirect ? null : children;
}