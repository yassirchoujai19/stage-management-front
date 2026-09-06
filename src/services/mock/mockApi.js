/**
 * Fake in-memory backend, used only while VITE_USE_MOCK_API=true.
 *
 * It mimics the REAL contract on purpose:
 *  - resolves with the same shapes the services expect,
 *  - rejects with the same normalised error object http.js produces
 *    ({ status, message, errors }), so views need zero changes when the
 *    real backend arrives.
 *
 * DELETE this folder and the `if (MOCK)` branches in the services once the
 * backend is live.
 */

const USERS = [
  { id: 1, name: 'Admin Cosmic', email: 'admin@stage.local', role: 'admin', password: 'password' },
  { id: 2, name: 'Tuteur Test', email: 'tutor@stage.local', role: 'tutor', password: 'password' },
  { id: 3, name: 'Etudiant Test', email: 'student@stage.local', role: 'student', password: 'password' },
]

const INTERNSHIPS = [
  { id: 1, title: 'Dev Frontend Vue - Cosmic Data', company: 'Cosmic Data', status: 'pending', student_id: 3 },
  { id: 2, title: 'Data Engineer - Orange', company: 'Orange', status: 'approved', student_id: 3 },
  { id: 3, title: 'DevOps - CGI', company: 'CGI', status: 'rejected', student_id: 3 },
]

/** Fake network latency, so loading states are actually visible. */
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

/** Same shape the http.js response interceptor rejects with. */
const fail = (status, message, errors = null) => Promise.reject({ status, message, errors, raw: null })

/** Token format: "mock.<userId>" - lets me() find the user again after F5. */
const tokenFor = (user) => `mock.${user.id}`
const userFromToken = (token) => USERS.find((u) => `mock.${u.id}` === token) ?? null

const strip = ({ password, ...safe }) => safe

export default {
  async login({ email, password }) {
    await delay()

    // 422: mimic backend field validation
    const errors = {}
    if (!email) errors.email = ['Email is required.']
    if (!password) errors.password = ['Password is required.']
    if (Object.keys(errors).length) return fail(422, 'Some fields are invalid.', errors)

    const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

    // 401: same message whether the email or the password is wrong (no user enumeration)
    if (!user || user.password !== password) return fail(401, 'Invalid email or password.')

    return { token: tokenFor(user), user: strip(user) }
  },

  async logout() {
    await delay(100)
    return null
  },

  async me(token) {
    await delay(200)
    const user = userFromToken(token)
    if (!user) return fail(401, 'Session expired. Please sign in again.')
    return strip(user)
  },

  async listInternships() {
    await delay()
    return { data: [...INTERNSHIPS] }
  },
}
