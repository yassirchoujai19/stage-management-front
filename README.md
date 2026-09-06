# stage-management-front

Vue 3 + Vite frontend for the internship ("stage") management app.
Built to work **before the backend exists**: every API detail is isolated in
`src/services/`, so connecting to the real API later means editing 2-3 files.

---

## 1. Quick start

```bash
npm install
# .env.development is already committed - edit it if your backend is not on :8000
npm run dev                        # http://localhost:5173
npm run build                      # production bundle into dist/
npm run preview                    # serve dist/ locally to test the build
```

---

## 2. How this was scaffolded

```bash
npm init -y
npm i vue vue-router pinia axios
npm i -D vite @vitejs/plugin-vue
```

The usual shortcut is `npm create vue@latest`, which asks a list of questions
(TypeScript? tests? ESLint?). Here the files were written by hand so nothing is
in the repo that you can't explain.

### What each dependency is for

| Package | Why |
|---|---|
| `vue` | The UI framework itself. |
| `vite` | Dev server (instant hot reload) + production bundler. |
| `@vitejs/plugin-vue` | Teaches Vite to compile `.vue` single-file components. |
| `vue-router` | Maps URLs to views, and holds the auth navigation guard. |
| `pinia` | Global state (the logged-in user) shared across components. |
| `axios` | HTTP client. Chosen over `fetch` for **interceptors** - one place to attach the token and handle 401/422. |

Deliberately not installed yet: UI kit, ESLint/Prettier, Vitest, TypeScript.
Add them when you actually need them.

---

## 3. Folder structure and the rule behind it

```
src/
├── assets/       static files + global CSS
├── components/   reusable pieces used INSIDE views (buttons, tables, form fields)
├── views/        one file per route/page (Login, Dashboard, Internships...)
├── router/       URL -> view mapping + navigation guards
├── stores/       Pinia stores: shared state (auth, current user...)
├── services/     ALL network code. The only place axios is imported.
├── composables/  reusable reactive logic (useXxx.js)
└── utils/        pure helpers, no Vue, no network (formatters, storage)
```

The one rule that keeps this maintainable:

> A component never calls `axios` directly. It calls a **service**, or a
> **store** that calls a service.

When the backend renames `/internships` to `/stages`, you edit one line in one
service file, not thirty components.

---

## 4. The axios layer

### `src/services/http.js` - the single instance

Every request in the app goes through this one configured axios instance:

- `baseURL` comes from `VITE_API_BASE_URL`, so dev/prod differ by env var only.
- `timeout: 15000` - a dead backend fails in 15s instead of hanging forever.
- **Request interceptor** attaches `Authorization: Bearer <token>` when a token exists.
- **Response interceptor** turns every failure into one predictable object:

```js
{ status: 422, message: 'Some fields are invalid.', errors: { email: [...] }, raw }
```

So every component handles errors the same way, and none of them has to know
whether the backend puts its message in `message`, `detail`, or `error`.

### `src/services/authService.js`, `internshipService.js` - one file per resource

Thin wrappers: one method per endpoint. Copy `internshipService.js` for each new
resource (companies, students, tutors...).

---

## 5. Environment variables

Vite only exposes vars prefixed with **`VITE_`** to the browser bundle, and it
**inlines them at build time**. Two consequences:

1. Never put a secret in `.env` - the built JS is public, anyone can read it.
2. Changing the API URL in production needs a **rebuild**, not a restart
   (that's why the Dockerfile takes it as a `--build-arg`).

| File | Used when |
|---|---|
| `.env.development` | `npm run dev` |
| `.env.production` | `npm run build` |
| `.env.example` | template, committed as documentation |

Read them in code with `import.meta.env.VITE_API_BASE_URL`.

### CORS: the proxy trick

Frontend on `:5173` calling a backend on `:8000` is a cross-origin request; the
browser blocks it unless the backend sends CORS headers. Rather than wait for
the backend dev, `vite.config.js` proxies `/api` to `VITE_PROXY_TARGET`. The
browser then only ever talks to `:5173` - same origin, no CORS. In production
nginx does the same job (`docker/nginx.conf`).

---

## 6. Authentication, prepared without a backend

Already wired end to end:

- `src/utils/tokenStorage.js` - the only file that knows *where* the token lives.
  Switching to httpOnly cookies later = rewrite this one file + set
  `withCredentials: true` in `http.js`.
- `src/stores/auth.js` - `login()`, `logout()`, `fetchUser()`, `isAuthenticated`, `role`.
- `router/index.js` - `meta: { requiresAuth: true }` on protected routes, plus a
  `beforeEach` guard that redirects to `/login?redirect=<where-you-wanted-to-go>`.
- `LoginView.vue` - form, loading state, field errors, global error.

⚠️ A route guard **hides UI, it is not security**. Anyone can edit the JS in
their browser. The backend must check permissions on every endpoint.

---

## 6b. Mock mode (log in with no backend)

`VITE_USE_MOCK_API=true` in `.env.development` swaps the network calls for
`src/services/mock/mockApi.js`, an in-memory fake backend. The login page then
shows the accounts as clickable links.

| Email | Role |
|---|---|
| `admin@example.com` | ADMIN |
| `ahmed@example.com` | SUPERVISOR |
| `youssef@example.com` | STUDENT |

Password for all three: **`password`**

Same emails, roles and payload shape as the Laravel seeder, so flipping the flag
changes nothing visible.

The mock reproduces the real contract on purpose - `401` on bad credentials,
`422` with per-field `errors` on empty fields, `401` on an unknown token, plus a
~400 ms delay so loading states are visible. So the views never learn they were
talking to a fake.

Turn it off with `VITE_USE_MOCK_API=false` and everything goes back over HTTP -
no other edit needed. `.env.production` already sets it to `false`, and the mock
is tree-shaken out of `npm run build` (verified: the fake emails appear nowhere
in `dist/`). Delete `src/services/mock/` and the three `if (MOCK)` branches once
the real API is live.

## 7. Error handling: what maps to what

| Status | Meaning | What the app does |
|---|---|---|
| `0` | No response (backend down, wrong URL, CORS) | "Server unreachable" message |
| `400` | Malformed request | Show `message` |
| `401` | No/expired/invalid token | Interceptor clears the token, redirects to `/login` |
| `403` | Authenticated, but not allowed | Show message / route to `/forbidden` |
| `404` | Resource doesn't exist | Show "not found" in the view |
| `409` | Conflict (duplicate, stale update) | Show `message` |
| `422` | Validation failed | `error.errors` rendered under each field |
| `429` | Rate limited | Show message, let the user retry |
| `5xx` | Server bug | Generic "try again later" |

The 401/403 distinction matters: **401 = who are you** (log in again),
**403 = I know who you are, no** (don't log the user out).

---

## 8. The backend contract (connected)

Backend: Laravel 13 + Sanctum, branch `develop` of `stage-management-back-end`.
Run it with `php artisan serve` on `:8000`; the Vite proxy does the rest.

**Swagger UI: http://localhost:8000/api/documentation**

| Method | Endpoint | Auth | Returns |
|---|---|---|---|
| POST | `/api/login` | public | `{ user, token }` |
| POST | `/api/logout` | Bearer | `{ message }` |
| GET | `/api/me` | Bearer | the user object, unwrapped |

User payload - note **`first_name` + `last_name`, there is no `name`**, and roles
are **uppercase**:

```json
{ "id": 4, "first_name": "Youssef", "last_name": "Amrani",
  "email": "youssef@example.com", "role": "STUDENT",
  "is_active": true, "created_at": "...", "updated_at": "..." }
```

Read names through `auth.displayName` and compare roles against the `ROLES` map
exported from `src/stores/auth.js` - never against raw strings.

Errors, verified against the running API:

| Case | Response |
|---|---|
| Wrong credentials | `401 { "message": "Invalid credentials" }` |
| Missing fields | `422 { message, errors: { email: [...], password: [...] } }` |
| No / stale token | `401 { "message": "Unauthenticated." }` |

Seeded accounts (all password `password`): `admin@example.com`,
`ahmed@`/`sara@example.com` (supervisors), `youssef@`/`imane@`/`omar@`/`nour@`/
`karim@`/`salma@example.com` (students).

### Still missing

- **No internships endpoint yet.** `/api/internships` returns 404, so the Stages
  view renders the error and stops - by design, nothing crashes.
- Admin user CRUD (`/api/users`) exists on the backend branch
  `feature/admin-crud`, not on `develop`.
- No refresh-token flow: Sanctum tokens do not expire by default.
- No "remember me" flag on the API; the login checkbox is not sent yet.

### Local gotchas

- The backend `.env.example` targets **MySQL** (`csm`). With no MySQL server,
  `DB_CONNECTION=sqlite` works - migrations and the seeder run clean on it.
- Its `composer.lock` needs **PHP >= 8.4.1**; on PHP 8.3 install with
  `composer install --ignore-platform-req=php`.

## 9. Docker

Already provided: `Dockerfile` (multi-stage node build → nginx),
`docker/nginx.conf` (SPA fallback + `/api` reverse proxy), `.dockerignore`,
`docker-compose.yml`.

```bash
docker build -t stage-front .
docker run -p 8080:80 stage-front       # http://localhost:8080
```

Two details that bite people:

- **SPA fallback** (`try_files $uri /index.html`): without it, refreshing on
  `/internships` returns nginx's 404, because no such file exists on disk.
- **Build-time env**: `VITE_*` is baked into the bundle during `npm run build`,
  so pass it as `--build-arg`, not as a runtime `-e`.

Add the backend as a service named `backend` in `docker-compose.yml` and
nginx's `proxy_pass http://backend:8000/api/` resolves it by container name.

---

## 10. Setup checklist

- [x] Vite + Vue 3 project builds (`npm run build`)
- [x] Dev server runs (`npm run dev`)
- [x] `@` alias → `src/`
- [x] Folder structure in place
- [x] Central axios instance with request + response interceptors
- [x] Errors normalised to `{ status, message, errors }`
- [x] Env vars for the API URL, `.env.example` committed
- [x] Dev proxy configured (no CORS friction)
- [x] Token storage isolated in one file
- [x] Pinia auth store (login / logout / fetchUser / role)
- [x] Router guards on protected routes
- [x] Login view with loading + 422 field errors
- [x] Mock backend so login works with no API (section 6b)
- [x] 403 and 404 views
- [x] Dockerfile + nginx SPA config
- [x] Get the API contract from the backend dev (section 8)
- [x] Point `VITE_PROXY_TARGET` at the real backend
- [x] Confirm login works against the real API (login, /me on refresh, logout revokes the token, 401 + 422 render)
- [x] Set `VITE_USE_MOCK_API=false` (mock kept for offline work)
- [ ] Build the Stages view once `/api/internships` exists
- [ ] Add linting (`eslint` + `prettier`) once the team agrees on rules
- [ ] Add tests (`vitest`) for stores and services
- [ ] Add a refresh-token flow if the backend issues short-lived tokens
