<template>
  <div class="anim-viewer">
    <canvas ref="canvasEl" class="anim-canvas" />

    <!-- 保存ボタン群 -->
    <div class="anim-toolbar">
      <!-- GIF -->
      <button
        class="sv-export-btn"
        :disabled="exporting !== null || !stereo"
        @click="saveGif"
      >
        <span v-if="exporting !== 'gif'">
          <i class="bi bi-file-earmark-play me-1" />{{ t.saveGif }}
        </span>
        <span v-else class="export-progress">
          <span class="spinner" />{{ t.encodingGif }} {{ Math.round(progress * 100) }}%
        </span>
      </button>
      <!-- WebP -->
      <button
        class="sv-export-btn sv-export-btn--webp"
        :disabled="exporting !== null || !stereo"
        @click="saveWebp"
      >
        <span v-if="exporting !== 'webp'">
          <i class="bi bi-file-earmark-image me-1" />{{ t.saveWebp }}
        </span>
        <span v-else class="export-progress">
          <span class="spinner" />{{ t.encodingWebp }} {{ Math.round(progress * 100) }}%
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { StereoImage, StretchMode } from '../types'
import { useAnimPlayer } from '../composables/useAnimPlayer'
import { exportGif, downloadBlob } from '../composables/useGifExport'
import { useI18n } from '../composables/useI18n'
const { t } = useI18n()
import { saveAnimWebp } from '../composables/useWebpExport'

const props = defineProps<{
  stereo: StereoImage
  speed: number
  scale: number
  stretch: StretchMode
  playing: boolean
}>()

const emit = defineEmits<{
  'update:playing': [v: boolean]
  'frame': [eye: string]
}>()

const canvasEl  = ref<HTMLCanvasElement | null>(null)
const player    = useAnimPlayer()
const exporting = ref<'gif' | 'webp' | null>(null)
const progress  = ref(0)

defineExpose({ toggle })

function toggle() {
  if (!canvasEl.value) return
  player.toggle(canvasEl.value, props.stereo, () => props.speed, () => props.scale, () => props.stretch)
  emit('update:playing', player.playing.value)
}

async function saveGif() {
  exporting.value = 'gif'
  progress.value  = 0
  // 再生中なら一時停止
  const wasPlaying = player.playing.value
  if (wasPlaying && canvasEl.value)
    player.stop(canvasEl.value, props.stereo, props.scale, props.stretch)

  try {
    const blob = await exportGif(
      props.stereo,
      props.speed,
      props.scale,
      props.stretch,
      (p) => { progress.value = p },
    )
    const base = props.stereo.fileName.replace(/\.[^.]+$/, '')
    downloadBlob(blob, `${base}_anim.gif`)
  } catch (e) {
    console.error('GIF export failed:', e)
    alert(t.value.gifError + (e instanceof Error ? e.message : String(e)))
  } finally {
    exporting.value = null
    // 再生を再開
    if (wasPlaying && canvasEl.value)
      player.start(canvasEl.value, props.stereo, () => props.speed, () => props.scale, () => props.stretch)
  }
}

async function saveWebp() {
  exporting.value = 'webp'
  progress.value  = 0
  const wasPlaying = player.playing.value
  if (wasPlaying && canvasEl.value)
    player.stop(canvasEl.value, props.stereo, props.scale, props.stretch)

  try {
    await saveAnimWebp(
      props.stereo,
      props.speed,
      props.scale,
      props.stretch,
      (p) => { progress.value = p },
    )
  } catch (e) {
    console.error('WebP export failed:', e)
    alert(t.value.webpError + (e instanceof Error ? e.message : String(e)))
  } finally {
    exporting.value = null
    if (wasPlaying && canvasEl.value)
      player.start(canvasEl.value, props.stereo, () => props.speed, () => props.scale, () => props.stretch)
  }
}

watch(() => props.playing, (val) => {
  if (!canvasEl.value) return
  if (val && !player.playing.value) {
    player.start(canvasEl.value, props.stereo, () => props.speed, () => props.scale, () => props.stretch)
  } else if (!val && player.playing.value) {
    player.stop(canvasEl.value, props.stereo, props.scale, props.stretch)
  }
})

watch([() => props.scale, () => props.stretch], () => {
  if (!canvasEl.value) return
  player.redraw(canvasEl.value, props.stereo, props.scale, props.stretch)
})

watch(() => props.stereo, () => {
  if (player.playing.value && canvasEl.value) {
    player.stop(canvasEl.value, props.stereo, props.scale, props.stretch)
    emit('update:playing', false)
  }
  if (canvasEl.value) {
    player.redraw(canvasEl.value, props.stereo, props.scale, props.stretch)
  }
})

watch(player.currentEye, (eye) => emit('frame', eye))

onMounted(() => {
  if (canvasEl.value) player.redraw(canvasEl.value, props.stereo, props.scale, props.stretch)
})

onUnmounted(() => {
  if (canvasEl.value && player.playing.value)
    player.stop(canvasEl.value, props.stereo, props.scale, props.stretch)
})
</script>

<style scoped>
.anim-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  overflow: auto;
}
.anim-canvas {
  border: 1px solid var(--border);
  border-radius: 4px;
  display: block;
  background: #000;
  box-shadow: 0 0 40px rgba(0,229,255,0.07);
  image-rendering: pixelated;
}

/* ── ツールバー ── */
.anim-toolbar {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

/* ── 共通エクスポートボタン ── */
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
.sv-export-btn--webp {
  border-color: var(--accent2);
  color: var(--accent2);
}
.sv-export-btn--webp:not(:disabled):hover {
  background: var(--accent2);
  color: #fff;
}

/* ── 進捗 ── */
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
