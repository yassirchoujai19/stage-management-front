<script setup>
import { computed } from 'vue';
import { iconSources, normalizeIcon } from './icons';

/**
 * UiIcon - renders one of the SVGs exported from the Figma maquettes.
 *
 * The icon inherits the surrounding text colour, so it works on a blue button
 * and on a white card without a variant prop.
 *
 *   <UiIcon name="mail" />
 *   <UiIcon name="plus" :size="12" />
 *   <UiIcon name="alert-triangle" label="Warning" />
 */
const props = defineProps({
  name: { type: String, required: true },
  /** Square size in px. */
  size: { type: [Number, String], default: 16 },
  /**
   * Decorative icons are hidden from assistive tech. Pass a label only when
   * the icon is the sole carrier of meaning (e.g. an icon-only button).
   */
  label: { type: String, default: '' },
});

const markup = computed(() => {
  const raw = iconSources[props.name];
  if (!raw) {
    if (import.meta.env.DEV) {
      console.warn(`[UiIcon] unknown icon "${props.name}"`);
    }
    return '';
  }
  return normalizeIcon(raw, props.name);
});
</script>

<template>
  <span
    class="ui-icon"
    :style="{ '--icon-size': `${size}px` }"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-html="markup"
  />
</template>

<style scoped>
.ui-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  color: inherit;
}

.ui-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
