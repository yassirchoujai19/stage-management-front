<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <h1>Dashboard</h1>
  <p class="muted">
    Signed in as {{ auth.user?.name ?? auth.user?.email ?? 'unknown user' }}
    <span v-if="auth.role"> - role: {{ auth.role }}</span>
  </p>
</template>
