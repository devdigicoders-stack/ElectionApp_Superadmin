import apiClient from './apiClient';

// ─────────────────────────────────────────────
// CUSTOM DOMAINS — Super Admin APIs
// ─────────────────────────────────────────────

const domainsService = {

  // GET /super-admin/domains?search=&status=&page=&limit=
  getAll: (params = {}) =>
    apiClient.get('/super-admin/domains', { params }).then(r => r.data.data),

  // GET /super-admin/tenants/:id/domain
  getDomainStatus: (tenantId) =>
    apiClient.get(`/super-admin/tenants/${tenantId}/domain`).then(r => r.data.data),

  // POST /super-admin/tenants/:id/domain
  // body: { domain: 'www.example.in' }
  configureDomain: (tenantId, domain) =>
    apiClient.post(`/super-admin/tenants/${tenantId}/domain`, { domain }).then(r => r.data.data),

  // POST /super-admin/tenants/:id/domain/verify
  // body: { forceVerify?: boolean, method?: 'AUTO'|'TXT'|'CNAME' }
  verifyDomain: (tenantId, body = {}) =>
    apiClient.post(`/super-admin/tenants/${tenantId}/domain/verify`, body).then(r => r.data.data),

  // DELETE /super-admin/tenants/:id/domain
  removeDomain: (tenantId) =>
    apiClient.delete(`/super-admin/tenants/${tenantId}/domain`).then(r => r.data.data),
};

export default domainsService;
