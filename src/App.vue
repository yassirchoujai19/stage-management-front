<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Auth screens are full-bleed: no app chrome around them.
const isBare = computed(() => route.meta.layout === 'auth')

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <RouterView v-if="isBare" />

  <template v-else>
    <header class="topbar">
      <strong>Stage Management</strong>
      <nav v-if="auth.isAuthenticated">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/internships">Stages</RouterLink>
      </nav>
      <div class="spacer" />
      <button v-if="auth.isAuthenticated" @click="onLogout">Sign out</button>
    </header>

    <main class="content">
      <!-- The router swaps the matching view in here -->
      <RouterView />
    </main>
  </template>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.topbar nav {
  display: flex;
  gap: 0.75rem;
}
.spacer {
  flex: 1;
}
.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
}
</style>
