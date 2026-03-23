<template>
  <div class="layout-wrap">
    <button
      class="layout-btn"
      :class="{ active: modelValue === 'side-by-side' }"
      :title="t.wideTip"
      :disabled="disabled"
      @click="emit('update:modelValue', 'side-by-side')"
    >
      <span class="icon icon-wide">
        <span /><span />
      </span>
      Wide
    </button>
    <button
      class="layout-btn"
      :class="{ active: modelValue === 'over-under' }"
      :title="t.portraitTip"
      :disabled="disabled"
      @click="emit('update:modelValue', 'over-under')"
    >
      <span class="icon icon-portrait">
        <span /><span />
      </span>
      Portrait
    </button>
  </div>
</template>

<script setup lang="ts">
import type { StereoLayout } from '../types'
import { useI18n } from '../composables/useI18n'
const { t } = useI18n()
defineProps<{ modelValue: StereoLayout; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: StereoLayout] }>()
</script>

<style scoped>
.layout-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.layout-btn {
  padding: 0.5rem 0.4rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: background var(--transition), color var(--transition);
}
.layout-btn + .layout-btn { border-left: 1px solid var(--border); }
.layout-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.layout-btn.active  { background: var(--accent); color: #000; font-weight: 700; }
.layout-btn:not(.active):hover { background: var(--surface2); color: var(--text); }

/* ミニ分割アイコン */
.icon {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.icon span {
  background: currentColor;
  border-radius: 1px;
  opacity: 0.8;
}
/* Wide: 左右2分割（横長2枚） */
.icon-wide { flex-direction: row; align-items: stretch; height: 12px; }
.icon-wide span { width: 8px; height: 12px; }
/* Portrait: 上下2分割（縦長2枚） */
.icon-portrait { flex-direction: column; width: 12px; }
.icon-portrait span { width: 12px; height: 5px; }
</style>
