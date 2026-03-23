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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from '../composables/useAnimPlayer'

const props = defineProps<{
  stereo: StereoImage
  scale: number
  stretch: StretchMode
  swapped: boolean
}>()

const canvasL = ref<HTMLCanvasElement | null>(null)
const canvasR = ref<HTMLCanvasElement | null>(null)

function draw() {
  const { w, h } = canvasSize(props.stereo, props.scale, props.stretch)
  const L = props.swapped ? props.stereo.right : props.stereo.left
  const R = props.swapped ? props.stereo.left  : props.stereo.right

  for (const [canvas, src] of [[canvasL.value, L], [canvasR.value, R]] as const) {
    if (!canvas) continue
    if (canvas.width !== w)  canvas.width  = w
    if (canvas.height !== h) canvas.height = h
    canvas.getContext('2d')!.drawImage(src, 0, 0, w, h)
  }
}

watch([() => props.scale, () => props.stretch, () => props.swapped, () => props.stereo], draw)
onMounted(draw)
</script>

<style scoped>
.fixed-viewer {
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
</style>
