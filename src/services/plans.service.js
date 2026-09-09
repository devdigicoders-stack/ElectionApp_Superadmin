import apiClient from './apiClient';

// ─────────────────────────────────────────────
// PLANS — Super Admin APIs
// Base: /super-admin/plans
// ─────────────────────────────────────────────

const plansService = {

  // GET /super-admin/plans — Sab plans laao
  getAll: (isActive) => {
    const params = isActive !== undefined ? { isActive } : {};
    return apiClient.get('/super-admin/plans', { params }).then(r => r.data.data);
  },

  // GET /super-admin/plans/:id — Ek plan ki detail
  getOne: (id) =>
    apiClient.get(`/super-admin/plans/${id}`).then(r => r.data.data),

  // POST /super-admin/plans — Naya plan banao
  // body: { name, slug, description?, price, currency?, billingCycle?, trialDays?, features?, limits?, isPopular?, isActive?, sortOrder? }
  create: (body) =>
    apiClient.post('/super-admin/plans', body).then(r => r.data.data),

  // PATCH /super-admin/plans/:id — Plan update karo
  update: (id, body) =>
    apiClient.patch(`/super-admin/plans/${id}`, body).then(r => r.data.data),

  // DELETE /super-admin/plans/:id — Plan delete karo
  remove: (id) =>
    apiClient.delete(`/super-admin/plans/${id}`).then(r => r.data.data),

  // PATCH /super-admin/plans/:id/toggle-active — Plan active/inactive karo
  // body: { isActive: true/false }
  toggleActive: (id, isActive) =>
    apiClient.patch(`/super-admin/plans/${id}/toggle-active`, { isActive }).then(r => r.data.data),

  // POST /super-admin/plans/assign/:tenantId — Tenant ko plan assign karo
  // body: { planId, durationMonths?, isTrial?, trialDays?, status? }
  assignToTenant: (tenantId, body) =>
    apiClient.post(`/super-admin/plans/assign/${tenantId}`, body).then(r => r.data.data),

  // GET /super-admin/tenants — Assign modal ke liye tenants list
  getTenants: () =>
    apiClient.get('/super-admin/tenants').then(r => r.data.data),
};

export default plansService;
