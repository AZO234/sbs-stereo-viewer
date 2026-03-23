<template>
  <div class="fs-wrap" title="文字サイズ">
    <button
      v-for="s in sizes"
      :key="s.value"
      class="fs-btn"
      :class="{ active: modelValue === s.value }"
      :aria-label="t.fontSizeLabel(t[s.labelKey])"
      @click="emit('update:modelValue', s.value)"
    >{{ t[s.labelKey] }}</button>
  </div>
</template>

<script setup lang="ts">
export type FontSize = 'sm' | 'md' | 'lg'

defineProps<{ modelValue: FontSize }>()
const emit = defineEmits<{ 'update:modelValue': [v: FontSize] }>()

const sizes: { value: FontSize; labelKey: 'fontSm' | 'fontMd' | 'fontLg' }[] = [
  { value: 'sm' as FontSize, labelKey: 'fontSm' as const },
  { value: 'md' as FontSize, labelKey: 'fontMd' as const },
  { value: 'lg' as FontSize, labelKey: 'fontLg' as const },
]
import { useI18n } from '../composables/useI18n'
const { t } = useI18n()
</script>

<style scoped>
.fs-wrap {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  flex-shrink: 0;
}
.fs-btn {
  padding: 0.25rem 0.55rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--sans);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  line-height: 1;
}
.fs-btn + .fs-btn { border-left: 1px solid var(--border); }
.fs-btn.active {
  background: var(--accent);
  color: #000;
  font-weight: 700;
}
.fs-btn:not(.active):hover {
  background: var(--surface2);
  color: var(--text);
}
</style>
