<template>
  <div class="locale-wrap" title="Language / 言語">
    <button
      class="locale-btn"
      :class="{ active: modelValue === 'ja' }"
      @click="emit('update:modelValue', 'ja')"
    >JA</button>
    <button
      class="locale-btn"
      :class="{ active: modelValue === 'en' }"
      @click="emit('update:modelValue', 'en')"
    >EN</button>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from '../composables/useI18n'
defineProps<{ modelValue: Locale }>()
const emit = defineEmits<{ 'update:modelValue': [v: Locale] }>()
</script>

<style scoped>
.locale-wrap {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  flex-shrink: 0;
}
.locale-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}
.locale-btn + .locale-btn { border-left: 1px solid var(--border); }
.locale-btn.active { background: var(--accent); color: #000; font-weight: 700; }
.locale-btn:not(.active):hover { background: var(--surface2); color: var(--text); }
</style>
