<template>
  <div class="stretch-wrap">
    <button
      v-for="m in modes"
      :key="m.value"
      class="stretch-btn"
      :class="{ active: modelValue === m.value }"
:title="t[m.titleKey]"
      @click="emit('update:modelValue', m.value)"
    >{{ m.label }}</button>
  </div>
</template>

<script setup lang="ts">
import type { StretchMode } from '../types'
import { useI18n } from '../composables/useI18n'
const { t } = useI18n()

defineProps<{ modelValue: StretchMode }>()
const emit = defineEmits<{ 'update:modelValue': [v: StretchMode] }>()

const modes: { value: StretchMode; label: string; titleKey: 'stretchWx2Tip' | 'stretchX1Tip' | 'stretchHx2Tip' }[] = [
  { value: 'Wx2' as StretchMode, label: 'W×2', titleKey: 'stretchWx2Tip' as const },
  { value: 'x1'  as StretchMode, label: '×1',  titleKey: 'stretchX1Tip'  as const },
  { value: 'Hx2' as StretchMode, label: 'H×2', titleKey: 'stretchHx2Tip' as const },
]
</script>

<style scoped>
.stretch-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.stretch-btn {
  padding: 0.5rem 0.25rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  text-align: center;
}
.stretch-btn + .stretch-btn {
  border-left: 1px solid var(--border);
}
.stretch-btn.active {
  background: var(--accent);
  color: #000;
  font-weight: 700;
}
.stretch-btn:not(.active):hover {
  background: var(--surface2);
  color: var(--text);
}
</style>
