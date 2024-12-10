// /frontend/services/sendRequest.js

import axiosClients from '../auth/axios-Instance-service';
import RequestMethod from '../../enums/request-methods';

/**
 * Sends an HTTP request to the backend.
 * No more media handling here, payload should already have the necessary media information (URLs, etc.)
 * 
 * @param {string} method - HTTP method (POST, PUT, DELETE, GET).
 * @param {string} url - The endpoint URL.
 * @param {Object} payload - The request payload (already prepared with media data).
 * @param {boolean} requireAuth - Whether the request requires authentication.
 * @param {Object} [customHeaders={}] - Custom headers for the request.
 * @returns {Promise<Object>} - The response data or an error object.
 */
export async function sendRequest(method, url, payload = null, requireAuth = false, customHeaders = {}) {
  if (!Object.values(RequestMethod).includes(method)) {
    throw new Error(`Invalid request method: ${method}`);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const requestData = {
    method,
    url,
    headers,
    data: payload,
  };

  const requestClient = requireAuth ? axiosClients.auth : axiosClients.public;

  try {
    const response = await requestClient(requestData);
    if (!response || !response.data) {
      console.warn("Response data is null or undefined.");
      return null;
    }
    return response.data;
  } catch (error) {
    if (error.response?.data) {
    if (error.response?.data) {
      return {
        error: true,
        message: error.response.data.message || 'Server Error',
        status: error.response.status,
      };
    } else if (error.response) {
      return {
        error: true,
        message: 'Network Error. No response received from server.',
        status: 503,  // Service Unavailable
      };
    } else {
      return {
        error: true,
        message: error.message || 'An unexpected error occurred',
        status: 500,
      };
    }
  }
}


/**
 * Sends an HTTP request, handling media uploads/deletions if present.
 * @param {string} method - HTTP method (e.g., POST, PUT, DELETE).
 * @param {string} url - The endpoint URL.
 * @param {Object} payload - The request payload.
 * @param {boolean} requireAuth - Whether the request requires authentication.
 * @param {Object} [customHeaders={}] - Custom headers for the request.
 * @returns {Promise<Object>} - The response data or an error object.
 */
export async function sendRequestTest(method, url, payload = null, requireAuth = false, customHeaders = {}) {
  if (!Object.values(RequestMethod).includes(method)) {
    throw new Error(`Invalid request method: ${method}`);
  }

  // Prepare the payload, handling media if necessary
  const processedData = await prepareData(method, payload);

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const requestData = {
    method,
    url,
    headers,
    data: processedData,
  };
}

}

export default sendRequest; 
