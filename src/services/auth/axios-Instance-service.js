import axios from 'axios';
import { getAccessToken, refreshToken } from './auth-service';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURLPublic = process.env.NEXT_PUBLIC_API_BASE_URL_Public; 

const authAxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, 
});

const publicAxiosInstance = axios.create({
  baseURL: baseURLPublic,
  withCredentials: true,
});

const axiosClients = {
  auth: authAxiosInstance,
  public: publicAxiosInstance,
};


/**
 * Request interceptor for authAxiosInstance
 * Attaches the access token to each request if available
 */
authAxiosInstance.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    if (token) {
      // Optionally, check if the token is expired
      if (isTokenExpired(token)) {
        await refreshToken();
        token = getAccessToken();
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** 
 * Response interceptor for authAxiosInstance
 * Handles 401 errors by attempting to refresh the token
 */
authAxiosInstance.interceptors.response.use(
  (response) =>  {  
    return response; 
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; 
      try {
        await refreshToken(); //setting up the new access token
        const newAccessToken = getAccessToken();
        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return authAxiosInstance(originalRequest);
        } 
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Function to check if the token is expired
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
  // const { exp } = JSON.parse(atob(token.split('.')[1]));
  // return Date.now() >= exp * 1000;
  return false ;
}

export default axiosClients;
