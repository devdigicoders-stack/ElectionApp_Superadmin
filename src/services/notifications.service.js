import apiClient from './apiClient';

export const notificationsService = {
  // System Inbox
  async getInbox(params = {}) {
    const res = await apiClient.get('/super-admin/notifications/inbox', { params });
    return res.data?.data || res.data;
  },

  async markRead(id) {
    const res = await apiClient.patch(`/super-admin/notifications/inbox/${id}/read`);
    return res.data?.data || res.data;
  },

  async markAllRead() {
    const res = await apiClient.patch('/super-admin/notifications/inbox/read-all');
    return res.data?.data || res.data;
  },

  async deleteAlert(id) {
    const res = await apiClient.delete(`/super-admin/notifications/inbox/${id}`);
    return res.data?.data || res.data;
  },

  // Platform Broadcasts
  async getBroadcasts(params = {}) {
    const res = await apiClient.get('/super-admin/notifications/broadcasts', { params });
    return res.data?.data || res.data;
  },

  async sendBroadcast(payload) {
    const res = await apiClient.post('/super-admin/notifications/broadcast', payload);
    return res.data?.data || res.data;
  },

  // Device FCM Tokens & Testing
  async registerFcmToken(token) {
    const res = await apiClient.post('/super-admin/notifications/register-fcm-token', { token });
    return res.data?.data || res.data;
  },

  async sendTestFcm(token) {
    const res = await apiClient.post('/super-admin/notifications/test-fcm', { token });
    return res.data?.data || res.data;
  },

  async getFirebaseStatus() {
    const res = await apiClient.get('/super-admin/notifications/firebase-status');
    return res.data?.data || res.data;
  },
};

export default notificationsService;
