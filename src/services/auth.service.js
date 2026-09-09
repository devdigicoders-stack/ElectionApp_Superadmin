import apiClient from './apiClient';

class AuthService {
  // POST /auth/super-admin/login
  // Backend response: { success: true, data: { token, admin } }
  async login(email, password) {
    const response = await apiClient.post('/auth/super-admin/login', { email, password });
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/';
  }

  getAdmin() {
    try {
      return JSON.parse(localStorage.getItem('admin')) || null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
