import apiClient from './apiClient';

// ─────────────────────────────────────────────
// TENANTS (Clients) — Super Admin APIs
// Base: /super-admin/tenants
// ─────────────────────────────────────────────

const tenantsService = {

  // GET /super-admin/tenants — Sab tenants laao
  getAll: () =>
    apiClient.get('/super-admin/tenants').then(r => r.data.data),

  // GET /super-admin/tenants/:id — Ek tenant ki detail
  getOne: (id) =>
    apiClient.get(`/super-admin/tenants/${id}`).then(r => r.data.data),

  // POST /super-admin/tenants — Naya tenant banao
  // body: { slug, name, customDomain?, branding?, settings? }
  create: (body) =>
    apiClient.post('/super-admin/tenants', body).then(r => r.data.data),

  // PATCH /super-admin/tenants/:id — Tenant info update karo
  // body: { name?, customDomain?, status?, branding?, settings? }
  update: (id, body) =>
    apiClient.patch(`/super-admin/tenants/${id}`, body).then(r => r.data.data),

  // PATCH /super-admin/tenants/:id/branding — Branding update karo
  // body: { logoUrl?, primaryColor?, leaderName?, tagline?, ... }
  updateBranding: (id, branding) =>
    apiClient.patch(`/super-admin/tenants/${id}/branding`, branding).then(r => r.data.data),

  // GET /super-admin/tenants/:id/features — Tenant ki features dekho
  getFeatures: (id) =>
    apiClient.get(`/super-admin/tenants/${id}/features`).then(r => r.data.data),

  // PATCH /super-admin/tenants/:id/features/:featureKey — Feature on/off karo
  // featureKey: 'complaints' | 'events' | 'polls' | 'gallery' | etc.
  // body: { isEnabled: true/false }
  toggleFeature: (id, featureKey, isEnabled) =>
    apiClient.patch(`/super-admin/tenants/${id}/features/${featureKey}`, { isEnabled }).then(r => r.data.data),

  // POST /super-admin/tenants/:id/admin-users — Tenant ka admin user banao
  // body: { name, email, password, role }
  createAdminUser: (id, body) =>
    apiClient.post(`/super-admin/tenants/${id}/admin-users`, body).then(r => r.data.data),

  // PATCH /super-admin/tenants/:id/suspend — Tenant suspend karo
  suspend: (id) =>
    apiClient.patch(`/super-admin/tenants/${id}/suspend`).then(r => r.data.data),

  // PATCH /super-admin/tenants/:id/activate — Tenant activate karo
  activate: (id) =>
    apiClient.patch(`/super-admin/tenants/${id}/activate`).then(r => r.data.data),

  // POST /super-admin/tenants/:id/impersonate — Tenant ke roop mein login karo
  // body: { reason?, durationHours? }
  impersonate: (id, body = {}) =>
    apiClient.post(`/super-admin/tenants/${id}/impersonate`, body).then(r => r.data.data),

  // POST /super-admin/tenants/:id/impersonate/exit — Session khatam karo
  // body: { notes? }
  exitImpersonation: (id, body = {}) =>
    apiClient.post(`/super-admin/tenants/${id}/impersonate/exit`, body).then(r => r.data.data),

  // GET /super-admin/tenants/:id/impersonation-history — History dekho
  getImpersonationHistory: (id) =>
    apiClient.get(`/super-admin/tenants/${id}/impersonation-history`).then(r => r.data.data),
};

export default tenantsService;
