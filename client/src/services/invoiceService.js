import api from './api';

export const invoiceService = {
  async getInvoices(params = {}) {
    const res = await api.get('/invoices', { params });
    return res.data;
  },

  async createInvoice(data) {
    const res = await api.post('/invoices', data);
    return res.data;
  },

  async deleteInvoice(id) {
    const res = await api.delete(`/invoices/${id}`);
    return res.data;
  },
};
