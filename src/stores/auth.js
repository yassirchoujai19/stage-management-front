import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { getToken, setToken, clearToken } from '@/utils/tokenStorage'

/** Role values exactly as the backend spells them. Compare against these, never
 *  against raw strings scattered through components. */
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  STUDENT: 'STUDENT',
})

/**
 * Global auth state. Any component can read it; nobody talks to the API directly.
 * Pinia store = shared reactive state + the actions that change it.
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  // Backend roles are uppercase - compare with the ROLES map above.
  const role = computed(() => user.value?.role ?? null)

  // The API returns first_name/last_name, never a single `name`. Everything that
  // shows a user goes through this, so one fallback chain covers the whole app.
  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    const full = [u.first_name, u.last_name].filter(Boolean).join(' ')
    return full || u.name || u.email || ''
  })

  const isAdmin = computed(() => role.value === ROLES.ADMIN)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const { token: t, user: u } = await authService.login(credentials)
      token.value = t
      setToken(t) // persist so a page refresh keeps the session
      user.value = u
      if (!u) await fetchUser() // backend returned only a token
      return true
    } catch (e) {
      error.value = e // already normalised by the http interceptor
      return false
    } finally {
      loading.value = false
    }
  }

  /** Called on app boot when a token exists but the user object doesn't. */
  async function fetchUser() {
    if (!token.value) return null
    try {
      user.value = await authService.me()
    } catch {
      // Token is stale/invalid -> behave as logged out.
      logout({ callApi: false })
    }
    return user.value
  }

  async function logout({ callApi = true } = {}) {
    if (callApi && token.value) await authService.logout()
    token.value = null
    user.value = null
    clearToken()
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    role,
    displayName,
    isAdmin,
    login,
    fetchUser,
    logout,
  }
})
