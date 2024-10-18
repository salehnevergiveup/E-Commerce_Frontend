import axios from 'axios';

/** 
 * @returns {string | null}
 */
export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

/** 
 * @param {string} token
 */
export function setAccessToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
}

/** 
 * Clears the access token from storage
 */
export function deleteAccessToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
}

/**
 * Refreshes the access token using the refresh token
 *@returns {Promise<string>} // new access token 
**/
export async function refreshToken() {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh`,
      null,
      {
        withCredentials: true,
      }
    );
    const newAccessToken = response.data.accessToken;
    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    deleteAccessToken();
    throw error;
  }
}
