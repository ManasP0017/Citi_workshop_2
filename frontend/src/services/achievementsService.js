import api from './api';

const ENDPOINT = '/api/achievements-service';

export const achievementsService = {
  // ── Legacy endpoints (used by Dashboard) ──

  async getAll(teamId = null) {
    const params = teamId ? { team_id: teamId } : {};
    const response = await api.get(ENDPOINT, { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post(ENDPOINT, data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  // ── Catalog endpoints ──

  async getCatalog() {
    const response = await api.get(`${ENDPOINT}/catalog`);
    return response.data;
  },

  async createCatalogItem(data) {
    const response = await api.post(`${ENDPOINT}/catalog`, data);
    return response.data;
  },

  async deleteCatalogItem(id) {
    await api.delete(`${ENDPOINT}/catalog/${id}`);
  },

  // ── Awards endpoints ──

  async getAwards(teamId = null) {
    const params = teamId ? { team_id: teamId } : {};
    const response = await api.get(`${ENDPOINT}/awards`, { params });
    return response.data;
  },

  async createAward(data) {
    const response = await api.post(`${ENDPOINT}/awards`, data);
    return response.data;
  },

  async deleteAward(id) {
    await api.delete(`${ENDPOINT}/awards/${id}`);
  },
};

export default achievementsService;
