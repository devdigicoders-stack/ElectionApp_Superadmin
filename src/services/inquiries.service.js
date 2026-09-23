import apiClient from './apiClient';

const inquiriesService = {
  // GET /super-admin/inquiries
  getAll: (params = {}) =>
    apiClient.get('/super-admin/inquiries', { params }).then(r => r.data?.data || r.data),

  // GET /super-admin/inquiries/stats
  getStats: () =>
    apiClient.get('/super-admin/inquiries/stats').then(r => r.data?.data || r.data),

  // GET /super-admin/inquiries/:id
  getOne: (id) =>
    apiClient.get(`/super-admin/inquiries/${id}`).then(r => r.data?.data || r.data),

  // PATCH /super-admin/inquiries/:id/status
  updateStatus: (id, { status, adminNotes }) =>
    apiClient.patch(`/super-admin/inquiries/${id}/status`, { status, adminNotes }).then(r => r.data?.data || r.data),

  // DELETE /super-admin/inquiries/:id
  delete: (id) =>
    apiClient.delete(`/super-admin/inquiries/${id}`).then(r => r.data?.data || r.data),
};

export default inquiriesService;
