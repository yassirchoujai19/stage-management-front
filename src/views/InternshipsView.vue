<script setup>
import { onMounted, ref } from 'vue'
import internshipService from '@/services/internshipService'

const items = ref([])
const loading = ref(false)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await internshipService.list()
    // Works whether the backend returns [] or { data: [] } (paginated).
    items.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch (e) {
    error.value = e // { status, message, errors } from the interceptor
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <h1>Stages</h1>

  <p v-if="loading" class="muted">Loading...</p>
  <p v-else-if="error" class="error">{{ error.message }} (HTTP {{ error.status }})</p>
  <p v-else-if="!items.length" class="muted">No internship yet.</p>

  <ul v-else>
    <li v-for="item in items" :key="item.id">
      {{ item.title ?? item.name ?? `#${item.id}` }}
    </li>
  </ul>

  <button @click="load" :disabled="loading">Reload</button>
</template>
