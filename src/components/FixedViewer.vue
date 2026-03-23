<template>
  <div class="fixed-viewer">
    <div class="fixed-wrap">
      <div class="eye-frame">
        <span class="eye-label" :class="swapped ? 'right' : 'left'">
          {{ swapped ? 'RIGHT → LEFT' : 'LEFT' }}
        </span>
        <canvas ref="canvasL" class="eye-canvas" />
      </div>
      <div class="divider" />
      <div class="eye-frame">
        <span class="eye-label" :class="swapped ? 'left' : 'right'">
          {{ swapped ? 'LEFT → RIGHT' : 'RIGHT' }}
        </span>
        <canvas ref="canvasR" class="eye-canvas" />
      </div>
    </div>

    <!-- PNG保存ボタン -->
    <div class="fixed-toolbar">
      <button
        class="sv-export-btn"
        :disabled="exporting"
        @click="savePng"
      >
        <span v-if="!exporting">
          <i class="bi bi-file-earmark-image me-1" />PNGで保存
        </span>
        <span v-else class="export-progress">
          <span class="spinner" />保存中…
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from '../composables/useAnimPlayer'
import { exportPng } from '../composables/usePngExport'

const props = defineProps<{
  stereo: StereoImage
  scale: number
  stretch: StretchMode
  swapped: boolean
}>()

const canvasL  = ref<HTMLCanvasElement | null>(null)
const canvasR  = ref<HTMLCanvasElement | null>(null)
const exporting = ref(false)

function draw() {
  const { w, h } = canvasSize(props.stereo, props.scale, props.stretch)
  const L = props.swapped ? props.stereo.right : props.stereo.left
  const R = props.swapped ? props.stereo.left  : props.stereo.right

  for (const [canvas, src] of [[canvasL.value, L], [canvasR.value, R]] as const) {
    if (!canvas) continue
    if (canvas.width  !== w) canvas.width  = w
    if (canvas.height !== h) canvas.height = h
    canvas.getContext('2d')!.drawImage(src, 0, 0, w, h)
  }
}

async function savePng() {
  exporting.value = true
  try {
    await exportPng(props.stereo, props.scale, props.stretch, props.swapped)
  } catch (e) {
    console.error('PNG export failed:', e)
    alert('PNG書き出しに失敗しました: ' + (e instanceof Error ? e.message : String(e)))
  } finally {
    exporting.value = false
  }
}

watch([() => props.scale, () => props.stretch, () => props.swapped, () => props.stereo], draw)
onMounted(draw)
</script>

<style scoped>
.fixed-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  overflow: auto;
}
.fixed-wrap {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.eye-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.eye-label {
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.eye-label.left  { color: var(--accent); }
.eye-label.right { color: var(--accent2); }
.eye-canvas {
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #000;
  display: block;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  image-rendering: pixelated;
}
.divider {
  width: 1px;
  min-height: 80px;
  background: var(--border);
  align-self: stretch;
  flex-shrink: 0;
}

/* ── ツールバー ── */
.fixed-toolbar {
  display: flex;
  justify-content: center;
}

/* ── エクスポートボタン（AnimViewer と同スタイル） ── */
.sv-export-btn {
  padding: 0.45rem 1.1rem;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background var(--transition), color var(--transition);
  min-width: 10rem;
  justify-content: center;
}
.sv-export-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.sv-export-btn:not(:disabled):hover {
  background: var(--accent);
  color: #000;
}
.export-progress {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.spinner {
  width: 12px; height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
