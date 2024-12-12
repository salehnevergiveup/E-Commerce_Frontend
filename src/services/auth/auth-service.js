import axios from 'axios';
import Routes from "@/enums/routes"
import EndPointBuilder from "@/services/routing/routingService"

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
/**
 * Refreshes the JWT access token using the refresh token stored in HTTP-only cookies.
 * @returns {Promise<string>} - Returns the new access token.
 * @throws {Error} - Throws an error if the refresh fails.
 */
export async function refreshToken() {
  console.log("refresh token test");
  try {
    // Build the refresh token endpoint URL
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.AUTHENTICATION)
      .addRoute(Routes.PUBLIC)
      .addRoute(Routes.REFRESH_TOKEN)
      .build();

    // Make the POST request to refresh the token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      { accessToken: getAccessToken() },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    const newAccessToken = response.data.data.accessToken;

    setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    deleteAccessToken();
    throw error;
  }
}

/**
 * Decodes a JWT token and returns the payload including permissions.
 * @param {string} token - The JWT token.
 * @returns {object|null} - The decoded payload or null if invalid.
 */
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Extract permissions if available (assuming Permission is an array)
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const exp = payload.exp;
    const permissions = {
      canCreate: payload.Permission?.includes("CanCreate"),
      canEdit: payload.Permission?.includes("CanEdit"),
      canDelete: payload.Permission?.includes("CanDelete"),
      canView: payload.Permission?.includes("CanView")
    };

    return { ...payload, role, permissions, exp, id }; // Return payload along with permissions
  } catch (e) {
    return null;
  }
} 
