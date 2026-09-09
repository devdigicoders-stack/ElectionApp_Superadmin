import apiClient from './apiClient';

// ─────────────────────────────────────────────
// SUBSCRIPTIONS — Super Admin APIs
// Base: /super-admin/subscriptions
// ─────────────────────────────────────────────

const subscriptionsService = {

  // GET /super-admin/subscriptions — Sab subscriptions list
  // params: { status?, tenantId?, planId?, expiringInDays?, search?, page?, limit? }
  getAll: (params = {}) =>
    apiClient.get('/super-admin/subscriptions', { params }).then(r => r.data.data),

  // GET /super-admin/subscriptions/stats — Stats
  getStats: () =>
    apiClient.get('/super-admin/subscriptions/stats').then(r => r.data.data),

  // GET /super-admin/subscriptions/expiring-soon?days=7
  getExpiringSoon: (days = 7) =>
    apiClient.get('/super-admin/subscriptions/expiring-soon', { params: { days } }).then(r => r.data.data),

  // GET /super-admin/subscriptions/tenant/:tenantId
  getByTenant: (tenantId) =>
    apiClient.get(`/super-admin/subscriptions/tenant/${tenantId}`).then(r => r.data.data),

  // GET /super-admin/subscriptions/:id
  getOne: (id) =>
    apiClient.get(`/super-admin/subscriptions/${id}`).then(r => r.data.data),

  // POST /super-admin/subscriptions — Naya subscription banao
  // body: { tenantId, planId, durationMonths?, isTrial?, trialDays?, amountPaid?, billingCycle?, paymentMethod?, paymentReference?, notes? }
  create: (body) =>
    apiClient.post('/super-admin/subscriptions', body).then(r => r.data.data),

  // POST /super-admin/subscriptions/:id/renew
  // body: { durationMonths, amountPaid?, paymentMethod?, paymentReference?, notes? }
  renew: (id, body) =>
    apiClient.post(`/super-admin/subscriptions/${id}/renew`, body).then(r => r.data.data),

  // POST /super-admin/subscriptions/:id/upgrade
  // body: { newPlanId, durationMonths?, amountPaid?, paymentMethod?, paymentReference?, notes? }
  upgrade: (id, body) =>
    apiClient.post(`/super-admin/subscriptions/${id}/upgrade`, body).then(r => r.data.data),

  // PATCH /super-admin/subscriptions/:id/extend-trial
  // body: { additionalDays, notes? }
  extendTrial: (id, body) =>
    apiClient.patch(`/super-admin/subscriptions/${id}/extend-trial`, body).then(r => r.data.data),

  // POST /super-admin/subscriptions/:id/cancel
  // body: { reason, immediate? }
  cancel: (id, body) =>
    apiClient.post(`/super-admin/subscriptions/${id}/cancel`, body).then(r => r.data.data),

  // POST /super-admin/subscriptions/:id/pause
  // body: { reason? }
  pause: (id, body = {}) =>
    apiClient.post(`/super-admin/subscriptions/${id}/pause`, body).then(r => r.data.data),

  // POST /super-admin/subscriptions/:id/resume
  resume: (id) =>
    apiClient.post(`/super-admin/subscriptions/${id}/resume`).then(r => r.data.data),
};

export default subscriptionsService;
