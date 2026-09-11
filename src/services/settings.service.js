import apiClient from './apiClient';

/**
 * Settings Service — Super Admin Platform & Third-Party Integrations (SRS Sec 2.1 & 73)
 */
const settingsService = {
  // GET /super-admin/settings — Get all settings with masked secrets
  getSettings: () => apiClient.get('/super-admin/settings').then(r => r.data?.data || r.data),

  // PUT /super-admin/settings/:category — Update specific category
  updateCategory: (category, data) =>
    apiClient.put(`/super-admin/settings/${category}`, data).then(r => r.data?.data || r.data),

  // POST /super-admin/settings/test-connection — Test integration
  testConnection: (provider, credentials) =>
    apiClient.post('/super-admin/settings/test-connection', { provider, credentials }).then(r => r.data),
};

export default settingsService;
