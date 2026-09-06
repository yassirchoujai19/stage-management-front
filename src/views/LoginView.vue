<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import UiButton from '@/components/ui/UiButton.vue';
import UiCheckbox from '@/components/ui/UiCheckbox.vue';
import UiField from '@/components/ui/UiField.vue';
import UiInput from '@/components/ui/UiInput.vue';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = ref({ email: '', password: '' });
// Not sent yet: the backend has no "remember me" flag. See README.
const remember = ref(true);

// Dev convenience only: the banner disappears as soon as VITE_USE_MOCK_API=false.
const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

// Literal, not imported from the mock module: importing it would pull the mock
// into the production bundle and defeat the tree-shaking. Keep in sync with
// src/services/mock/mockApi.js (same emails as the Laravel seeder).
const mockAccounts = [
  { email: 'admin@example.com', role: 'ADMIN' },
  { email: 'ahmed@example.com', role: 'SUPERVISOR' },
  { email: 'youssef@example.com', role: 'STUDENT' },
];

/** 422: field-level errors returned by the backend. */
function fieldError(name) {
  const errors = auth.error?.errors?.[name];
  if (!errors) return '';
  return Array.isArray(errors) ? errors[0] : errors;
}

/** Everything else: 401 wrong credentials, 0 backend down, 500... */
const generalError = computed(() =>
  auth.error && !auth.error.errors ? auth.error.message : '',
);

function fillMock(email) {
  form.value = { email, password: 'password' };
}

async function onSubmit() {
  const ok = await auth.login(form.value);
  if (ok) router.push(route.query.redirect || { name: 'home' });
}
</script>

<template>
  <div class="auth">
    <main class="auth__card">
      <header class="auth__header">
        <p class="u-eyebrow">Welcome back</p>
        <h1 class="auth__title">Sign in to your workspace</h1>
        <p class="auth__subtitle">
          Use your university or company account to continue.
        </p>
      </header>

      <form class="auth__form" novalidate @submit.prevent="onSubmit">
        <UiField label="Email address" :error="fieldError('email')">
          <UiInput
            v-model="form.email"
            size="lg"
            type="email"
            icon="mail"
            placeholder="john.smith@example.com"
            autocomplete="username"
            required
          />
        </UiField>

        <UiField label="Password" :error="fieldError('password')">
          <template #labelAction>
            <UiButton variant="link" type="button">Forgot password?</UiButton>
          </template>
          <UiInput
            v-model="form.password"
            size="lg"
            type="password"
            icon="lock"
            placeholder="••••••••••"
            autocomplete="current-password"
            revealable
            required
          />
        </UiField>

        <UiCheckbox v-model="remember" label="Remember me for 30 days" />

        <p v-if="generalError" class="auth__error" role="alert">
          {{ generalError }}
        </p>

        <UiButton
          type="submit"
          size="lg"
          block
          icon-after="arrow-right"
          :loading="auth.loading"
        >
          {{ auth.loading ? 'Signing in…' : 'Sign in securely' }}
        </UiButton>

        <p class="auth__help">
          Having trouble signing in? Contact your internship administrator.
        </p>
      </form>
    </main>

    <section v-if="isMock" class="auth__mock">
      <p class="auth__mock-title">Mock mode</p>
      <p class="auth__mock-body">
        No backend needed. Password for every account:
        <code>password</code>
      </p>
      <ul class="auth__mock-list">
        <li v-for="account in mockAccounts" :key="account.email">
          <UiButton variant="link" type="button" @click="fillMock(account.email)">
            {{ account.email }} - {{ account.role }}
          </UiButton>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-8) var(--space-4);
  gap: var(--space-4);
  background: var(--color-canvas-auth);
}

.auth__card {
  width: 100%;
  max-width: var(--layout-auth-card);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
}

.auth__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

.auth__title {
  color: var(--color-text);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-2xl);
}

.auth__subtitle {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-sm);
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* The checkbox, the submit button and the help panel each get a little more
   air than the field-to-field rhythm. */
.auth__form > .ui-checkbox {
  margin-top: var(--space-1);
}
.auth__form > .ui-button {
  margin-top: var(--space-1);
}

.auth__error {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--tone-danger-border);
  border-radius: var(--radius-md);
  background: var(--tone-danger-bg);
  color: var(--tone-danger-fg);
  font-size: var(--text-sm);
  line-height: var(--leading-sm);
}

.auth__help {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(241, 245, 249, 0.7);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 19px;
}

/* --- Dev-only mock helper (not part of the maquettes) ----------------- */
.auth__mock {
  width: 100%;
  max-width: var(--layout-auth-card);
  padding: var(--space-4);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  line-height: var(--leading-xs);
}

.auth__mock-title {
  color: var(--color-text-label);
  font-weight: var(--weight-bold);
}

.auth__mock-body {
  margin-top: var(--space-1);
}

.auth__mock-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-2);
  list-style: none;
}
</style>
