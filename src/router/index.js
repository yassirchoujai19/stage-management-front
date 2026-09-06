import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'), // lazy: its own JS chunk
    meta: { requiresAuth: true },
  },
  {
    path: '/internships',
    name: 'internships',
    component: () => import('@/views/InternshipsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
  },
  {
    // Catch-all for unknown URLs.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/**
 * Navigation guard: runs before every route change.
 * This is the frontend half of auth - it hides UI. The backend still has to
 * enforce permissions on every endpoint; a guard is not security.
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Token in storage but no user loaded yet (fresh page load) -> fetch it once.
  if (auth.isAuthenticated && !auth.user) await auth.fetchUser()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
  // Role check, ready for when the backend defines roles (admin/tutor/student...)
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'forbidden' }
  }
  return true
})

export default router
