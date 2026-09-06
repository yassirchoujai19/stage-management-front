<script setup>
import { useId } from 'vue';

/**
 * UiCheckbox - 16px box with a white tick on --blue-600 when checked.
 *
 * The native input stays in the DOM (opacity 0, stretched over the box) so
 * keyboard, form submission and assistive tech all keep working; the visible
 * square is a sibling that reacts to :checked.
 */
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const id = useId();
</script>

<template>
  <div class="ui-checkbox" :class="{ 'is-disabled': disabled }">
    <span class="ui-checkbox__box">
      <input
        :id="id"
        class="ui-checkbox__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', $event.target.checked)"
      />
      <svg class="ui-checkbox__tick" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2.5 6.2 4.8 8.5 9.5 3.8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>

    <label v-if="label || $slots.default" class="ui-checkbox__label" :for="id">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<style scoped>
.ui-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ui-checkbox.is-disabled {
  opacity: 0.55;
}

.ui-checkbox__box {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xs);
  background: var(--color-surface);
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    border-color var(--duration-fast) var(--ease-in-out);
}

.ui-checkbox__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.ui-checkbox__input:disabled {
  cursor: not-allowed;
}

.ui-checkbox__tick {
  width: 12px;
  height: 12px;
  color: var(--color-text-inverse);
  opacity: 0;
  pointer-events: none;
}

.ui-checkbox__input:checked ~ .ui-checkbox__tick {
  opacity: 1;
}

.ui-checkbox__box:has(.ui-checkbox__input:checked) {
  border-color: var(--blue-600);
  background: var(--blue-600);
}

.ui-checkbox__box:has(.ui-checkbox__input:focus-visible) {
  outline: 2px solid var(--blue-600);
  outline-offset: 2px;
}

.ui-checkbox__label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-sm);
  cursor: pointer;
}
.ui-checkbox.is-disabled .ui-checkbox__label {
  cursor: not-allowed;
}
</style>
