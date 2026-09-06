<script setup>
import { computed, provide, useId } from 'vue';

/**
 * UiField - label + control + help/error, wired together for screen readers.
 *
 * Owns the ids so the control does not have to. It hands them down through
 * provide(), which UiInput / UiTextarea / UiSelect pick up.
 *
 *   <UiField label="Email address" required :error="err">
 *     <UiInput v-model="email" type="email" icon="mail" />
 *     <template #labelAction><a href="#">Forgot password?</a></template>
 *   </UiField>
 */
const props = defineProps({
  label: { type: String, default: '' },
  /** Renders the red asterisk AND marks the control required. */
  required: { type: Boolean, default: false },
  /** Helper copy under the control. Hidden while an error is showing. */
  hint: { type: String, default: '' },
  /** Error message. Truthy value also puts the control in its error state. */
  error: { type: String, default: '' },
});

const uid = useId();
const controlId = `${uid}-control`;
const hintId = `${uid}-hint`;
const errorId = `${uid}-error`;

const describedBy = computed(() => {
  const ids = [];
  if (props.error) ids.push(errorId);
  else if (props.hint) ids.push(hintId);
  return ids.length ? ids.join(' ') : undefined;
});

// Contract consumed by the control components in this folder.
provide('uiField', {
  id: controlId,
  describedBy,
  invalid: computed(() => Boolean(props.error)),
  required: computed(() => props.required),
});
</script>

<template>
  <div class="ui-field">
    <div v-if="label || $slots.labelAction" class="ui-field__label-row">
      <label class="ui-field__label" :for="controlId">
        {{ label }}<span v-if="required" class="ui-field__required" aria-hidden="true"> *</span>
      </label>
      <slot name="labelAction" />
    </div>

    <slot />

    <p v-if="error" :id="errorId" class="ui-field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="ui-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ui-field__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
}

.ui-field__label {
  color: var(--color-text-label);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-sm);
}

.ui-field__required {
  color: var(--red-500);
}

.ui-field__error {
  margin-top: var(--space-1);
  color: var(--tone-danger-fg);
  font-size: var(--text-xs);
  line-height: var(--leading-xs);
}

.ui-field__hint {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  line-height: var(--leading-xs);
}
</style>
