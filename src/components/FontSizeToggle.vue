<template>
  <div class="fs-wrap" title="文字サイズ">
    <button
      v-for="s in sizes"
      :key="s.value"
      class="fs-btn"
      :class="{ active: modelValue === s.value }"
      :aria-label="`文字サイズ${s.label}`"
      @click="emit('update:modelValue', s.value)"
    >{{ s.label }}</button>
  </div>
</template>

<script setup lang="ts">
export type FontSize = 'sm' | 'md' | 'lg'

defineProps<{ modelValue: FontSize }>()
const emit = defineEmits<{ 'update:modelValue': [v: FontSize] }>()

const sizes: { value: FontSize; label: string }[] = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
]
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
