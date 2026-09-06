import http from './http'
import mockApi from './mock/mockApi'

const MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * Example domain service (stages / internships).
 * Copy this shape for every other resource: one file per resource,
 * one method per endpoint, no axios import anywhere but http.js.
 */
export default {
  list(params = {}) {
    if (MOCK) return mockApi.listInternships(params)
    // params -> query string, e.g. { page: 2, status: 'pending' } -> ?page=2&status=pending
    return http.get('/internships', { params }).then((r) => r.data)
  },

  get(id) {
    return http.get(`/internships/${id}`).then((r) => r.data)
  },

  create(payload) {
    return http.post('/internships', payload).then((r) => r.data)
  },

  update(id, payload) {
    return http.put(`/internships/${id}`, payload).then((r) => r.data)
  },

  remove(id) {
    return http.delete(`/internships/${id}`).then((r) => r.data)
  },
}
