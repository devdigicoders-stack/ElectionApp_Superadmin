import apiClient from './apiClient';

const masterAreasService = {
  // Cascading lookups
  getStates: async () => {
    const res = await apiClient.get('/master-areas/states');
    return res.data?.data || res.data || [];
  },

  getLokSabhas: async (stateId) => {
    const res = await apiClient.get('/master-areas/lok-sabhas', {
      params: stateId ? { stateId } : {},
    });
    return res.data?.data || res.data || [];
  },

  getDistricts: async (stateId) => {
    const res = await apiClient.get('/master-areas/districts', {
      params: stateId ? { stateId } : {},
    });
    return res.data?.data || res.data || [];
  },

  getVidhanSabhas: async (filters = {}) => {
    const res = await apiClient.get('/master-areas/vidhan-sabhas', {
      params: filters,
    });
    return res.data?.data || res.data || [];
  },

  getBlocks: async (filters = {}) => {
    const res = await apiClient.get('/master-areas/blocks', {
      params: filters,
    });
    return res.data?.data || res.data || [];
  },

  getPanchayats: async (filters = {}) => {
    const res = await apiClient.get('/master-areas/panchayats', {
      params: filters,
    });
    return res.data?.data || res.data || [];
  },

  getGrams: async (filters = {}) => {
    const res = await apiClient.get('/master-areas/grams', {
      params: filters,
    });
    return res.data?.data || res.data || [];
  },

  getWards: async (filters = {}) => {
    const res = await apiClient.get('/master-areas/wards', {
      params: filters,
    });
    return res.data?.data || res.data || [];
  },

  getSummary: async () => {
    const res = await apiClient.get('/master-areas/summary');
    return res.data?.data || res.data || {};
  },

  getTree: async (stateId) => {
    const res = await apiClient.get('/master-areas/tree', {
      params: stateId ? { stateId } : {},
    });
    return res.data?.data || res.data || [];
  },

  // Super Admin CRUD
  createArea: async (data) => {
    const res = await apiClient.post('/master-areas', data);
    return res.data?.data || res.data;
  },

  updateArea: async (id, data) => {
    const res = await apiClient.patch(`/master-areas/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteArea: async (id) => {
    const res = await apiClient.delete(`/master-areas/${id}`);
    return res.data?.data || res.data;
  },

  // 1-Click Uttar Pradesh Seeding
  seedUttarPradesh: async () => {
    const res = await apiClient.post('/master-areas/seed-up');
    return res.data?.data || res.data;
  },

  // 1-Click Provision Tenant
  provisionTenant: async (tenantId, payload) => {
    const res = await apiClient.post(`/master-areas/provision-tenant/${tenantId}`, payload);
    return res.data?.data || res.data;
  },
};

export default masterAreasService;
