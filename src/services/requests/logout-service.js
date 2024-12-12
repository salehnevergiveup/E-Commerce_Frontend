import { deleteAccessToken } from '@/services/auth/auth-service';
import sendRequest from '@/services/requests/request-service';

/**
 * @param {string} endpoint
 * @param {string} requestMethod
 * @returns {Promise} 
 */
async function logout(requestMethod, endpoint) {
  deleteAccessToken();
  try {
    await sendRequest(requestMethod, endpoint, null, false);
  } catch (error) {
    return {
      error: true,
      message: error.message || 'An unexpected error occurred',
      status: 500,
    };
  }
}
export default logout;