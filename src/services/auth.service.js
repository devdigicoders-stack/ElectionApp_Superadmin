import apiClient from './apiClient';

class AuthService {
  /**
   * Super Admin Login API
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} response data containing token and admin details
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/super-admin/login', {
      email,
      password,
    });
    return response.data;
  }

  /**
   * Logout function
   */
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}

export default new AuthService();
