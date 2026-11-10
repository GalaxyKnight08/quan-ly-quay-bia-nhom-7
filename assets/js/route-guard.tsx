import { useEffect, type ReactNode } from 'react';
import { authService } from '../../services/auth-service.ts';

interface RouteGuardProps {
  children: ReactNode;
  guestOnly?: boolean;
}

export function RouteGuard({ children, guestOnly = false }: RouteGuardProps) {
  const user = authService.currentUser();
  const shouldRedirect = guestOnly ? Boolean(user) : !user;

  useEffect(() => {
    if (shouldRedirect) {
      window.location.replace(guestOnly ? './dashboard.html' : './index.html');
    }
  }, [guestOnly, shouldRedirect]);

  return shouldRedirect ? null : children;
}