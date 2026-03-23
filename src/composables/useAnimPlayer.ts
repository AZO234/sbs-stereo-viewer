import { ref, readonly } from 'vue'
import type { StereoImage, StretchMode } from '../types'

export function useAnimPlayer() {
  const playing    = ref(false)
  const currentEye = ref<'left' | 'right'>('left')

  let rafId      = 0
  let epochStart = 0   // 現在の「表示フェーズ」の開始時刻

  // フェーズ管理
  // ┌─────────────────── speed ms ───────────────────┐
  // │ fromEye フェードアウト ←t→ toEye フェードイン  │
  // └────────────────────────────────────────────────┘
  let fromEye: 'left' | 'right' = 'right'  // 前フレーム（フェードアウト側）
  let toEye:   'left' | 'right' = 'left'   // 現フレーム（フェードイン側）

  function start(
    canvas: HTMLCanvasElement,
    stereo: StereoImage,
    getSpeed: () => number,
    getScale: () => number,
    getStretch: () => StretchMode,
  ) {
    if (playing.value) return
    playing.value = true

    // 初期状態: left を表示中、right からのフェードインとして開始
    toEye        = 'left'
    fromEye      = 'right'
    epochStart   = performance.now()
    currentEye.value = toEye

    const loop = (ts: number) => {
      if (!playing.value) return

      const speed   = getSpeed()
      const elapsed = ts - epochStart

      if (elapsed >= speed) {
        // 次のフェーズへ: 今の toEye が次の fromEye になる
        fromEye    = toEye
        toEye      = toEye === 'left' ? 'right' : 'left'
        epochStart = ts
        currentEye.value = toEye
      }

      // t: 0.0（フェーズ開始）→ 1.0（フェーズ終了）
      const t = Math.min((ts - epochStart) / speed, 1.0)

      crossfadeFrame(canvas, stereo, fromEye, toEye, t, getScale(), getStretch())
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

// ── 単画像描画（停止時） ───────────────────────────────────────
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

// ── クロスフェード描画 ─────────────────────────────────────────
// t=0: from が 100%  →  t=1: to が 100%
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
    // フェーズ開始直後: from を 100% 表示
    ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }
  if (t >= 1) {
    // フェーズ完了: to を 100% 表示
    ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
    return
  }

  // 正しいクロスフェード合成:
  // to を不透明で敷き、その上に from を (1-t) の透明度で重ねる
  // → t=0: from が 100% で to を隠す  = from の画像
  // → t=0.5: from が 50% alpha → to と正しく 50/50 合成
  // → t=1: from が 0% → to の画像だけ見える
  ctx.globalAlpha = 1
  ctx.drawImage(to === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
  ctx.globalAlpha = 1 - t
  ctx.drawImage(from === 'left' ? stereo.left : stereo.right, 0, 0, w, h)
  ctx.globalAlpha = 1
}

// ── StretchMode に応じた描画先サイズを計算 ──────────────────────
export function canvasSize(stereo: StereoImage, scale: number, stretch: StretchMode) {
  const { halfWidth: hw, height: hh, originalSize: o } = stereo
  let w: number, h: number
  switch (stretch) {
    case 'Wx2': w = o.w; h = o.h; break
    case 'x1':  w = hw;  h = hh;  break
    case 'Hx2': w = o.w; h = o.h; break
  }
  return {
    w: Math.round(w * scale),
    h: Math.round(h * scale),
  }
}

function resizeIfNeeded(canvas: HTMLCanvasElement, w: number, h: number) {
  if (canvas.width  !== w) canvas.width  = w
  if (canvas.height !== h) canvas.height = h
}
