import axios from 'axios'
import { getToken, clearToken } from '@/utils/tokenStorage'

/**
 * ONE axios instance for the whole app.
 * Import this everywhere instead of raw `axios` so that base URL, headers,
 * timeouts and error handling are defined exactly once.
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
  // Flip to true ONLY if the backend authenticates with cookies/sessions
  // instead of a token. Then the backend must also send
  // Access-Control-Allow-Credentials: true and an explicit origin.
  withCredentials: false,
})

/* ---------- REQUEST interceptor: runs before every call leaves the app ---------- */
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    // "Bearer" is the common scheme (JWT / OAuth2). Confirm with the backend dev.
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ---------- RESPONSE interceptor: runs after every reply comes back ---------- */
http.interceptors.response.use(
  // 2xx: hand the response straight through, untouched.
  (response) => response,

  // Non-2xx (or no response at all): normalise it into one predictable shape.
  (error) => {
    const status = error.response?.status ?? 0
    const data = error.response?.data

    const normalised = {
      status,
      // Server message if there is one, otherwise a human-readable fallback.
      message: data?.message || data?.detail || data?.error || defaultMessage(status),
      // Field-level validation errors, e.g. { email: ['already taken'] }.
      errors: data?.errors || data?.violations || null,
      raw: error,
    }

    if (status === 401) {
      // Token missing/expired/invalid -> drop it and let the app send the user to /login.
      clearToken()
      // Router isn't imported here (circular import); the auth guard picks this up
      // on the next navigation, and the login view reacts to the store being empty.
      if (window.location.pathname !== '/login') {
        window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }

    return Promise.reject(normalised)
  },
)

function defaultMessage(status) {
  switch (status) {
    case 0:
      return 'Server unreachable. Check that the backend is running and the API URL is right.'
    case 400:
      return 'Bad request.'
    case 401:
      return 'Session expired. Please sign in again.'
    case 403:
      return 'You are not allowed to do that.'
    case 404:
      return 'Resource not found.'
    case 409:
      return 'Conflict: this resource already exists or changed meanwhile.'
    case 422:
      return 'Some fields are invalid.'
    case 429:
      return 'Too many requests. Slow down.'
    default:
      return status >= 500 ? 'Server error. Try again later.' : 'Unexpected error.'
  }
}

export default http
