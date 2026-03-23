<template>
  <div class="status-bar">
    <div class="item">SIZE: <span>{{ size }}</span></div>
    <div class="item">MODE: <span>{{ mode }}</span></div>
    <div class="item">FRAME: <span>{{ frame }}</span></div>
    <div class="item">SCALE: <span>{{ scale }}</span></div>
    <div class="item" v-if="layout">LAYOUT: <span>{{ layout }}</span></div>
    <div class="item" v-if="stretch">STRETCH: <span>{{ stretch }}</span></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size: string
  mode: string
  frame: string
  scale: string
  layout?: string
  stretch?: string
}>()
</script>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 0.3rem 1.25rem;
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--text);
  display: flex;
  gap: 2rem;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.item { display: flex; gap: 0.4rem; align-items: center; }
.item span { color: var(--accent); }
</style>
