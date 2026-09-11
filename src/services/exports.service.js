import apiClient from './apiClient';

/**
 * Exports Service — Super Admin Data Exports Center (SRS Sec 58)
 */
const exportsService = {
  // GET /exports — Get available domains catalog & documentation
  getCatalog: () => apiClient.get('/exports').then(r => r.data),

  // GET /exports/history — Get export download audit trail
  getHistory: (limit = 50) => apiClient.get(`/exports/history?limit=${limit}`).then(r => r.data),

  // GET /super-admin/tenants — List of clients for the tenant dropdown
  getTenants: () => apiClient.get('/super-admin/tenants').then(r => r.data?.data || r.data || []),

  // GET /exports/:domain — Stream and trigger file download
  downloadExport: async (domain, params = {}) => {
    const res = await apiClient.get(`/exports/${domain}`, {
      params,
      responseType: 'blob',
    });

    // Try extracting filename from headers
    const disposition = res.headers['content-disposition'] || '';
    let filename = `${domain}_export_${Date.now()}.${params.format === 'excel' ? 'xlsx' : 'csv'}`;

    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }

    // Trigger browser file download
    const blob = new Blob([res.data], {
      type: params.format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  },
};

export default exportsService;
