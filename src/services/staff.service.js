import apiClient from './apiClient';

const staffService = {
  // GET /super-admin/staff
  getAll: (params = {}) =>
    apiClient.get('/super-admin/staff', { params }).then(r => r.data?.data || r.data),

  // GET /super-admin/staff/roles
  getRoles: () =>
    apiClient.get('/super-admin/staff/roles').then(r => r.data?.data || r.data),

  // GET /super-admin/staff/:id
  getOne: (id) =>
    apiClient.get(`/super-admin/staff/${id}`).then(r => r.data?.data || r.data),

  // POST /super-admin/staff
  create: (body) =>
    apiClient.post('/super-admin/staff', body).then(r => r.data?.data || r.data),

  // PATCH /super-admin/staff/:id
  update: (id, body) =>
    apiClient.patch(`/super-admin/staff/${id}`, body).then(r => r.data?.data || r.data),

  // PATCH /super-admin/staff/:id/status  (toggle active/inactive)
  toggleStatus: (id) =>
    apiClient.patch(`/super-admin/staff/${id}/status`).then(r => r.data?.data || r.data),

  // PATCH /super-admin/staff/:id/reset-password
  resetPassword: (id, newPassword) =>
    apiClient.patch(`/super-admin/staff/${id}/reset-password`, { newPassword }).then(r => r.data?.data || r.data),

  // DELETE /super-admin/staff/:id
  remove: (id) =>
    apiClient.delete(`/super-admin/staff/${id}`).then(r => r.data?.data || r.data),
};

export default staffService;
