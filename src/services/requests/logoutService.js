import { deleteAccessToken } from './auth/authService';

function logout() {
  deleteAccessToken();
  console.log('Logout successful');
}

export default logout;