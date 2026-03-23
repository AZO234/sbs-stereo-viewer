<template>
  <div class="stretch-wrap">
    <button
      v-for="m in modes"
      :key="m.value"
      class="stretch-btn"
      :class="{ active: modelValue === m.value }"
      :title="m.title"
      @click="emit('update:modelValue', m.value)"
    >{{ m.label }}</button>
  </div>
</template>

<script setup lang="ts">
import type { StretchMode } from '../types'

defineProps<{ modelValue: StretchMode }>()
const emit = defineEmits<{ 'update:modelValue': [v: StretchMode] }>()

const modes: { value: StretchMode; label: string; title: string }[] = [
  { value: 'Wx2', label: 'W×2', title: '1眼を元の全幅に引き伸ばす（SBS 16:9向け）' },
  { value: 'x1',  label: '×1',  title: '1眼をそのまま等倍表示（SBS 32:9向け）' },
  { value: 'Hx2', label: 'H×2', title: '1眼を元の全高に引き伸ばす（O/U向け）' },
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
