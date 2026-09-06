<script setup>
import { computed, inject, ref, useAttrs } from 'vue';
import UiIcon from './UiIcon.vue';

defineOptions({ inheritAttrs: false });

/**
 * UiInput - single-line text control.
 *
 * Two sizes, both straight from the maquettes:
 *   lg  38px tall, radius 12, --slate-50 fill   (auth screen)
 *   md  30px tall, radius 6,  white fill        (create / edit user forms)
 *
 * Picks up its id / aria wiring from a surrounding <UiField>. Works standalone
 * too - then you own the label.
 */
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  size: { type: String, default: 'md', validator: (v) => ['md', 'lg'].includes(v) },
  /** Icon name shown inside the left edge. */
  icon: { type: String, default: '' },
  /** Force the error style without a <UiField> wrapper. */
  invalid: { type: Boolean, default: false },
  /** Adds the show/hide toggle. Only meaningful with type="password". */
  revealable: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const attrs = useAttrs();

// Injected by UiField; the fallback keeps the component usable on its own.
const field = inject('uiField', null);

const revealed = ref(false);

const resolvedType = computed(() =>
  props.revealable && revealed.value ? 'text' : props.type,
);

const isInvalid = computed(() => props.invalid || Boolean(field?.invalid.value));

const iconSize = computed(() => (props.size === 'lg' ? 14 : 12));
</script>

<template>
  <div
    class="ui-input"
    :class="[`is-${size}`, { 'is-invalid': isInvalid, 'has-icon': icon, 'has-action': revealable }]"
  >
    <UiIcon v-if="icon" class="ui-input__icon" :name="icon" :size="iconSize" />

    <input
      v-bind="attrs"
      :id="field?.id"
      class="ui-input__control"
      :type="resolvedType"
      :value="modelValue"
      :required="field?.required.value || undefined"
      :aria-invalid="isInvalid || undefined"
      :aria-describedby="field?.describedBy.value"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="revealable"
      type="button"
      class="ui-input__action"
      :aria-label="revealed ? 'Hide password' : 'Show password'"
      :aria-pressed="revealed"
      @click="revealed = !revealed"
    >
      <UiIcon name="eye" :size="iconSize" />
    </button>
  </div>
</template>

<style scoped>
.ui-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  transition:
    border-color var(--duration-fast) var(--ease-in-out),
    box-shadow var(--duration-fast) var(--ease-in-out);
}

.ui-input.is-md {
  height: var(--control-height-md);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.ui-input.is-lg {
  height: 38px;
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
}

/* Focus lives on the wrapper so the icon and the reveal button sit inside the
   ring instead of outside it. */
.ui-input:focus-within {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 var(--ring-width) var(--ring-color);
}

.ui-input.is-invalid {
  border-color: var(--red-500);
}
.ui-input.is-invalid:focus-within {
  box-shadow: 0 0 0 var(--ring-width) var(--ring-color-danger);
}

.ui-input__control {
  width: 100%;
  height: 100%;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--color-text-body);
  font-size: var(--text-sm);
  line-height: var(--leading-sm);
}

.ui-input__control:focus {
  outline: none;
}

/* Chrome paints its own background over the fill on autofill. */
.ui-input__control:-webkit-autofill {
  -webkit-text-fill-color: var(--color-text-body);
  transition: background-color 100000s ease-in-out 0s;
}

.ui-input__icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}
.ui-input.is-lg .ui-input__icon {
  left: 14px;
}

.ui-input.has-icon .ui-input__control {
  padding-left: 39px;
}
.ui-input.is-md.has-icon .ui-input__control {
  padding-left: 34px;
}

.ui-input.has-action .ui-input__control {
  padding-right: 38px;
}

.ui-input__action {
  position: absolute;
  right: var(--space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  margin: 0;
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}
.ui-input__action:hover {
  color: var(--color-text-secondary);
}
</style>
