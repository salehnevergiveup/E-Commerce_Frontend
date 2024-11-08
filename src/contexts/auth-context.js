// contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAccessToken, setAccessToken, deleteAccessToken, decodeToken, refreshToken as refreshTokenService } from '@/services/auth/auth-service';
import login from '@/services/requests/login-service';
import logout from '@/services/requests/logout-service';
import { toast } from 'react-toastify';
import Routes from "@/enums/routes"
import RequestMethod from "@/enums/request-methods"
import EndPointBuilder from "@/services/routing/routingService"

const AuthContext = createContext();

/**
 * Custom hook to access AuthContext
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider component that wraps the application and provides authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not authenticated
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  /**
   * Initialize user state on component mount
   */
  useEffect(() => {
    const initializeUser = async () => {
      const token = getAccessToken();
      if (token) {
        const decoded = decodeToken(token);

        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setLoading(false);
        } else {
          try {
            const newToken = await refreshTokenService();
            const newDecoded = decodeToken(newToken);
            setUser(newDecoded);
            setLoading(false);
          } catch (error) {
            // Refresh failed, logout the 
            handleLogout();
            setLoading(false);
          }
        }
      } else {
        setUser(null); 
        setLoading(false);
      }
    };

    initializeUser();

    // Optionally, set up an interval to refresh the token periodically
    const interval = setInterval(() => {
      const token = getAccessToken();
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp * 1000 < Date.now()) {
          
          refreshTokenService()
            .then((newToken) => {

              const newDecoded = decodeToken(newToken);
              setUser(newDecoded);
            })
            .catch(() => {

              handleLogout();
            });
        }
      }
    }, 5 * 60 * 500); //every 5min

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle user login
   * @param {Object} credentials - User credentials
   * @param {string} userType - 'admin' or 'user'
   */
  const handleLogin = async (credentials, userType = 'user') => {
    try {

      let endpoint = new EndPointBuilder()
        .addRoute(Routes.AUTHENTICATION)
        .addRoute(Routes.PUBLIC);

      const requestMethod = RequestMethod.POST
      if (userType === 'admin') {
        endpoint = endpoint.addRoute('admin'); // Adjust based on your API routing
      }

      endpoint = endpoint.addRoute(Routes.LOGIN)
        .build(); 

      const response = await login(requestMethod, endpoint, credentials, setUser);

      if (response && response.data && response.data.accessToken) {
        const decoded = decodeToken(response.data.accessToken);
        setUser(decoded);
        // Redirect based on userType
        if (userType === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
        toast.success('Login successful!');
      } else {
        // Handle login failure
        toast.error(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login.');
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {

    let endpoint = new EndPointBuilder()
        .addRoute(Routes.AUTHENTICATION)
        .addRoute(Routes.PUBLIC)
        .addRoute(Routes.LOGOUT)
        .build();
    logout(RequestMethod.POST, endpoint);
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
