import http from './http'
import mockApi from './mock/mockApi'
import { getToken } from '@/utils/tokenStorage'

// Flip with VITE_USE_MOCK_API in .env.development. When false, every call below
// goes to the real backend and the mock import is tree-shaken out of the build.
const MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * All auth-related endpoints in one place.
 * ⚠️ Paths and payload field names below are GUESSES until the backend dev
 * confirms them - see the "Questions for the backend dev" list in README.md.
 * When they differ, you change them HERE and nowhere else.
 */
export default {
  /** POST /auth/login -> { token, user } */
  async login({ email, password }) {
    if (MOCK) return mockApi.login({ email, password })

    const { data } = await http.post('/auth/login', { email, password })
    return {
      token: data.token ?? data.access_token ?? data.accessToken,
      user: data.user ?? data.data ?? null,
    }
  },

  /** POST /auth/logout - some backends have none; failure is not fatal. */
  logout() {
    if (MOCK) return mockApi.logout()
    return http.post('/auth/logout').catch(() => null)
  },

  /** GET /auth/me -> current user, used to restore a session after F5. */
  async me() {
    if (MOCK) return mockApi.me(getToken())

    const { data } = await http.get('/auth/me')
    return data.user ?? data.data ?? data
  },
}
