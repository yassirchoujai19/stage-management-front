<script setup>
import { computed, useAttrs } from 'vue';
import UiIcon from './UiIcon.vue';

defineOptions({ inheritAttrs: false });

/**
 * UiButton - every clickable action in the app.
 *
 * Variants map 1:1 to the maquettes:
 *   primary   blue fill      "Sign in securely", "Add user", "Save changes"
 *   secondary white + border "Cancel", "Change supervisor"
 *   danger    red fill       "Deactivate user"
 *   ghost     transparent    icon-only topbar actions
 *   link      text only      "View all", "Forgot password?", "Back to users"
 *
 * Renders as <button> by default, or as <RouterLink>/<a> when `to`/`href` is
 * passed - so a link that looks like a button is still a link.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'link'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  /** Icon name rendered before the label. */
  icon: { type: String, default: '' },
  /** Icon name rendered after the label. */
  iconAfter: { type: String, default: '' },
  /** Square button with no label - `label` becomes the accessible name. */
  iconOnly: { type: Boolean, default: false },
  /** Accessible name. Required when iconOnly. */
  label: { type: String, default: '' },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  /** vue-router target - renders a RouterLink. */
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
});

const attrs = useAttrs();

const tag = computed(() => {
  if (props.to) return 'RouterLink';
  if (props.href) return 'a';
  return 'button';
});

const isDisabled = computed(() => props.disabled || props.loading);

const bindings = computed(() => {
  const base = { ...attrs };
  if (tag.value === 'button') {
    return { ...base, type: props.type, disabled: isDisabled.value };
  }
  // A disabled link is not a thing in HTML; take it out of the tab order and
  // tell assistive tech instead.
  return {
    ...base,
    ...(props.to ? { to: props.to } : { href: props.href }),
    ...(isDisabled.value ? { tabindex: -1, 'aria-disabled': 'true' } : {}),
  };
});

const iconSize = computed(() => (props.size === 'lg' ? 14 : 12));
</script>

<template>
  <component
    :is="tag"
    class="ui-button"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block, 'is-icon-only': iconOnly, 'is-loading': loading }]"
    :aria-label="iconOnly ? label : undefined"
    :aria-busy="loading ? 'true' : undefined"
    v-bind="bindings"
  >
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <UiIcon v-else-if="icon" :name="icon" :size="iconSize" />
    <span v-if="!iconOnly" class="ui-button__label"><slot>{{ label }}</slot></span>
    <UiIcon v-if="iconAfter && !loading" :name="iconAfter" :size="iconSize" />
  </component>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    border-color var(--duration-fast) var(--ease-in-out),
    color var(--duration-fast) var(--ease-in-out),
    box-shadow var(--duration-fast) var(--ease-in-out);
}

.ui-button:hover {
  text-decoration: none;
}

/* --- Sizes ------------------------------------------------------------ */
.ui-button.is-sm {
  height: var(--control-height-sm);
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
}
.ui-button.is-md {
  height: var(--control-height-md);
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
}
.ui-button.is-lg {
  height: var(--control-height-lg);
  padding: 0 var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}

.ui-button.is-icon-only {
  padding: 0;
  aspect-ratio: 1;
}

.ui-button.is-block {
  width: 100%;
}

/* --- Variants --------------------------------------------------------- */
.ui-button.is-primary {
  background: var(--blue-600);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-xs);
}
.ui-button.is-primary:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--blue-700);
}

.ui-button.is-secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-label);
  font-weight: var(--weight-medium);
}
.ui-button.is-secondary:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--color-surface-subtle);
  border-color: var(--color-border-strong);
}

.ui-button.is-danger {
  background: var(--red-600);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-xs);
}
.ui-button.is-danger:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--red-700);
}
.ui-button.is-danger:focus-visible {
  outline-color: var(--red-600);
}

.ui-button.is-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.ui-button.is-ghost:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--color-surface-muted);
  color: var(--color-text-body);
}

.ui-button.is-link {
  height: auto;
  padding: 0;
  background: transparent;
  color: var(--color-text-link);
  font-weight: var(--weight-bold);
}
.ui-button.is-link:hover:not(:disabled):not([aria-disabled='true']) {
  color: var(--blue-700);
  text-decoration: underline;
}

/* --- States ----------------------------------------------------------- */
.ui-button:disabled,
.ui-button[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.55;
}

.ui-button.is-loading {
  cursor: progress;
}

.ui-button__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-radius: var(--radius-full);
  border-right-color: transparent;
  animation: ui-button-spin 600ms linear infinite;
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
