// src/components/auth-guard.jsx

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';
import Spinner from '@/components/spinner'; // Create a Spinner component or use an existing one

const AuthGuard = (
  WrappedComponent,
  { allowedRoles = [], requiredPermissions = [] } = {}
) => {
  const Guard = (props) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          // User not authenticated, redirect to login
          router.replace('/'); // Adjust the login path as necessary
        } else {
          const userRole = user.role?.toLowerCase();

          if (
            allowedRoles.length > 0 &&
            !allowedRoles.map(role => role.toLowerCase()).includes(userRole)
          ) {
            // User does not have an allowed role, redirect to unauthorized
            router.replace('/errors/unauthorized');
            return;
          }

          // Check for required permissions
          if (requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every(
              (perm) => user.permissions && user.permissions[perm]
            );

            if (!hasAllPermissions) {
              // User lacks required permissions, redirect to unauthorized
              router.replace('/errors/unauthorized');
              return;
            }
          }
        }
      }
    }, [isAuthenticated, user, loading, router, allowedRoles, requiredPermissions]);

    if (loading) {
      // Render a full-page loader while authentication status is being determined
      return (
        <div className="flex items-center justify-center h-screen">
          <Spinner /> {/* Ensure you have a Spinner component */}
        </div>
      );
    }

    if (!isAuthenticated) {
      // Optionally, render nothing while redirecting
      return null;
    }

    // If authenticated and authorized, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return Guard;
};

export default AuthGuard;
