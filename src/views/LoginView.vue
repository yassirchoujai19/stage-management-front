<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = ref({ email: '', password: '' });

// Dev convenience only: the banner disappears as soon as VITE_USE_MOCK_API=false.
const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

const mockAccounts = [
  'admin@stage.local',
  'tutor@stage.local',
  'student@stage.local',
];

function fillMock(email) {
  form.value = { email, password: 'password' };
}

async function onSubmit() {
  const ok = await auth.login(form.value);
  if (ok) router.push(route.query.redirect || { name: 'home' });
}
</script>

<template>
  <h1>Sign in</h1>

  <form class="login" @submit.prevent="onSubmit">
    <label>
      Email
      <input
        v-model="form.email"
        type="email"
        required
        autocomplete="username"
      />
      <!-- 422: field-level errors returned by the backend -->
      <small v-if="auth.error?.errors?.email" class="error">
        {{ auth.error.errors.email[0] ?? auth.error.errors.email }}
      </small>
    </label>

    <label>
      Password
      <input
        v-model="form.password"
        type="password"
        required
        autocomplete="current-password"
      />
      <small v-if="auth.error?.errors?.password" class="error">
        {{ auth.error.errors.password[0] ?? auth.error.errors.password }}
      </small>
    </label>

    <!-- Everything else: 401 wrong credentials, 0 backend down, 500... -->
    <p v-if="auth.error && !auth.error.errors" class="error">
      {{ auth.error.message }}
    </p>

    <button type="submit" :disabled="auth.loading">
      {{ auth.loading ? 'Signing in...' : 'Sign in' }}
    </button>
  </form>

  <section v-if="isMock" class="mock">
    <strong>Mock mode</strong> - no backend needed. Password for all accounts:
    <code>password</code>
    <ul>
      <li v-for="email in mockAccounts" :key="email">
        <button type="button" class="link" @click="fillMock(email)">
          {{ email }}
        </button>
      </li>
    </ul>
  </section>

  <p v-else class="muted">
    Backend not ready? The API contract lives in
    <code>src/services/authService.js</code>.
  </p>
</template>

<style scoped>
.mock {
  margin-top: 2rem;
  padding: 0.9rem 1.1rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  max-width: 360px;
}
.mock ul {
  margin: 0.5rem 0;
  padding-left: 1.1rem;
}
.link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
}
.login {
  display: grid;
  gap: 1rem;
  max-width: 360px;
}
label {
  display: grid;
  gap: 0.35rem;
}
</style>
