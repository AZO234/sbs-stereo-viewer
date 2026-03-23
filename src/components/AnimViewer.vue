<template>
  <div class="anim-viewer">
    <canvas ref="canvasEl" class="anim-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { StereoImage, StretchMode } from '../types'
import { useAnimPlayer } from '../composables/useAnimPlayer'

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

const canvasEl = ref<HTMLCanvasElement | null>(null)
const player = useAnimPlayer()

defineExpose({ toggle })

function toggle() {
  if (!canvasEl.value) return
  player.toggle(canvasEl.value, props.stereo, () => props.speed, () => props.scale, () => props.stretch)
  emit('update:playing', player.playing.value)
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
  justify-content: center;
  align-items: center;
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
</style>
