import sendRequest from '@/services/requests/request-service';
import { setAccessToken, decodeToken } from '@/services/auth/auth-service';  // Import setAccessToken and decodeToken

/**
 * @param {Object} credentials
 * @param {string} endpoint
 * @param {string} requestMethod
 * @returns {Promise} 
 */
async function login(requestMethod, endpoint, credentials) {
  try {
    const response = await sendRequest(requestMethod, endpoint, credentials, false);
    
    if (response.data.accessToken != "") {
      const token = response.data.accessToken;
      setAccessToken(token);
      return response;
    } else {
      return response;
    }

  } catch (error) {
    return {
      error: true,
      message: error.message || 'An unexpected error occurred',
      status: 500,
    };
  }
}

export default login;
