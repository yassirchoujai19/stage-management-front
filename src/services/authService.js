import http from './http'
import mockApi from './mock/mockApi'
import { getToken } from '@/utils/tokenStorage'

// Flip with VITE_USE_MOCK_API in .env.development. When false, every call below
// goes to the real backend and the mock import is tree-shaken out of the build.
const MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * All auth-related endpoints in one place.
 * Matches the Laravel + Sanctum API on branch `develop`:
 *   POST /api/login   public  -> { user, token }
 *   POST /api/logout  bearer  -> { message }
 *   GET  /api/me      bearer  -> user object (returned bare, not wrapped)
 */
export default {
  /** POST /api/login -> { token, user } */
  async login({ email, password }) {
    if (MOCK) return mockApi.login({ email, password })

    const { data } = await http.post('/login', { email, password })
    return { token: data.token, user: data.user ?? null }
  },

  /** POST /api/logout - revokes the current token. A failure must not trap the
   *  user in a logged-in UI, so errors are swallowed and the client-side
   *  cleanup in the auth store runs regardless. */
  logout() {
    if (MOCK) return mockApi.logout()
    return http.post('/logout').catch(() => null)
  },

  /** GET /api/me -> current user, used to restore a session after F5. */
  async me() {
    if (MOCK) return mockApi.me(getToken())

    const { data } = await http.get('/me')
    return data
  },
}
