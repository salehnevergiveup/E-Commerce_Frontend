// components/GuestGuard.js

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'react-toastify';

/**
 * Higher-Order Component to protect guest-only pages.
 * Redirects authenticated users to their respective dashboards.
 * @param {React.ComponentType} WrappedComponent - The component to protect.
 */
const GuestGuard = (WrappedComponent) => {
  const Guard = (props) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && isAuthenticated) {
        // Redirect based on user role
        if (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'superadmin') {
          router.replace('/admin/dashboard');
        } else if (user.role.toLowerCase() === 'user') {
          router.replace('/');//for now 
        } else {
          toast.error('You are already logged in.');
          router.replace('/');
        }
      }
    }, [isAuthenticated, loading, router, user]);

    if (isAuthenticated) {
      // While redirecting, don't render the wrapped component
      return null;
    }

    // If not authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return Guard;
};

export default GuestGuard;
