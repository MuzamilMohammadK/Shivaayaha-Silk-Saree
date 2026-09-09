import api from './api';

export const partyService = {
  async getParties() {
    const res = await api.get('/parties');
    return res.data;
  },

  async createParty(data) {
    const res = await api.post('/parties', data);
    return res.data;
  },

  async updateParty(id, data) {
    const res = await api.put(`/parties/${id}`, data);
    return res.data;
  },

  async deleteParty(id) {
    const res = await api.delete(`/parties/${id}`);
    return res.data;
  },

  async getPartyLedger(id) {
    const res = await api.get(`/parties/${id}/ledger`);
    return res.data;
  },
};
