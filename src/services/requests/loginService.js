import sendRequest from './requestService';
import { setAccessToken } from './auth/authService';
import Routes from '../enums/routes';
import RequestMethod from '../enums/requestMethod';

/**
 * @param {Object} credentials
 * @returns {Promise} 
 */
async function login(credentials) {
    try {
      const endpoint = `/${Routes.LOGIN}`;
      const response = await sendRequest(RequestMethod.POST, endpoint, credentials, false);//no header sent 
  
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        console.log('Login successful');
        return response;
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

export default login;
