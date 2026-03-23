import { ref, readonly } from 'vue'
import type { StereoImage, StretchMode } from '../types'

export function useAnimPlayer() {
  const playing    = ref(false)
  const currentEye = ref<'left' | 'right'>('left')

  let rafId      = 0
  let lastSwitch = 0
  let fromEye: 'left' | 'right' = 'left'
  let crossT = 1.0

  function start(
    canvas: HTMLCanvasElement,
    stereo: StereoImage,
    getSpeed: () => number,
    getScale: () => number,
    getStretch: () => StretchMode,
  ) {
    if (playing.value) return
    playing.value = true
    lastSwitch    = performance.now()
    crossT        = 1.0

    const loop = (ts: number) => {
      if (!playing.value) return
      const speed   = getSpeed()
      const elapsed = ts - lastSwitch

      if (elapsed >= speed) {
        fromEye          = currentEye.value
        currentEye.value = currentEye.value === 'left' ? 'right' : 'left'
        lastSwitch = ts
        crossT     = 0.0
      }

      crossT = Math.min((ts - lastSwitch) / speed, 1.0)
      crossfadeFrame(canvas, stereo, fromEye, currentEye.value, crossT, getScale(), getStretch())
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  }

  function stop(canvas: HTMLCanvasElement, stereo: StereoImage, scale: number, stretch: StretchMode) {
    playing.value = false
    cancelAnimationFrame(rafId)
    drawSingle(canvas, stereo, currentEye.value, scale, stretch)
  }

  function toggle(
    canvas: HTMLCanvasElement,
    stereo: StereoImage,
    getSpeed: () => number,
    getScale: () => number,
    getStretch: () => StretchMode,
  ) {
    if (playing.value) stop(canvas, stereo, getScale(), getStretch())
    else               start(canvas, stereo, getSpeed, getScale, getStretch)
  }

  function redraw(canvas: HTMLCanvasElement, stereo: StereoImage, scale: number, stretch: StretchMode) {
    if (!playing.value) drawSingle(canvas, stereo, currentEye.value, scale, stretch)
  }

  return { playing: readonly(playing), currentEye: readonly(currentEye), start, stop, toggle, redraw }
}

function drawSingle(
  canvas: HTMLCanvasElement,
  stereo: StereoImage,
  eye: 'left' | 'right',
  scale: number,
  stretch: StretchMode,
) {
  const { w, h } = canvasSize(stereo, scale, stretch)
  resizeIfNeeded(canvas, w, h)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(eye === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
}

function crossfadeFrame(
  canvas: HTMLCanvasElement,
  stereo: StereoImage,
  from: 'left' | 'right',
  to: 'left' | 'right',
  t: number,
  scale: number,
  stretch: StretchMode,
) {
  const { w, h } = canvasSize(stereo, scale, stretch)
  resizeIfNeeded(canvas, w, h)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)

  if (t <= 0) {
    ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }
  if (t >= 1) {
    ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }
  ctx.globalAlpha = 1 - t
  ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
  ctx.globalAlpha = t
  ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
  ctx.globalAlpha = 1
}

/** StretchMode に応じた描画先サイズを計算 */
export function canvasSize(stereo: StereoImage, scale: number, stretch: StretchMode) {
  const { halfWidth: hw, height: hh, originalSize: o } = stereo
  let w: number, h: number
  switch (stretch) {
    case 'Wx2': w = o.w; h = o.h; break           // 全幅×全高（元解像度）
    case 'x1':  w = hw;  h = hh;  break           // 1眼そのまま
    case 'Hx2': w = o.w; h = o.h; break           // O/U 全高（同上）
  }
  return {
    w: Math.round(w * scale),
    h: Math.round(h * scale),
  }
}

function resizeIfNeeded(canvas: HTMLCanvasElement, w: number, h: number) {
  if (canvas.width !== w)  canvas.width  = w
  if (canvas.height !== h) canvas.height = h
}
