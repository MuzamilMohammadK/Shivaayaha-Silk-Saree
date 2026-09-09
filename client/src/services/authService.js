import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async forgotPassword(data) {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  async resetPassword(data) {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
