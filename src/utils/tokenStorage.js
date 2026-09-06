/**
 * Single place that knows WHERE the auth token is kept.
 * Everything else (http.js, the auth store) goes through these three functions,
 * so switching to cookies later means editing this file only.
 */
const KEY = 'sm_access_token'

const backend = () =>
  import.meta.env.VITE_TOKEN_STORAGE === 'sessionStorage' ? sessionStorage : localStorage

export function getToken() {
  try {
    return backend().getItem(KEY)
  } catch {
    return null // private browsing / storage disabled
  }
}

export function setToken(token) {
  try {
    if (token) backend().setItem(KEY, token)
    else backend().removeItem(KEY)
  } catch {
    /* ignore: app still works for the current page load */
  }
}

export function clearToken() {
  setToken(null)
}
