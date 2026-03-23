import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from './useAnimPlayer'

/**
 * クロスフェードの中間フレームを含む全フレームを Canvas として生成する。
 *
 * 1ループ構成:
 *   left 固定表示 (hold) → left→right クロスフェード →
 *   right 固定表示 (hold) → right→left クロスフェード
 *
 * @param stereo      立体画像
 * @param speed       1サイクル（片道）の時間 ms
 * @param scale       表示倍率
 * @param stretch     引き伸ばしモード
 * @param crossFps    クロスフェード部分のfps（デフォルト 15）
 * @param minCross    クロスフェードの最低フレーム数（デフォルト 6）
 */
export function renderCrossfadeFrames(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  crossFps  = 15,
  minCross  = 6,
): { canvas: HTMLCanvasElement; delayMs: number }[] {
  const { w, h } = canvasSize(stereo, scale, stretch)

  // クロスフェードに使う時間 = speed の 100%（固定表示なし）
  // → アプリと同じ「常にフェード中」の動作に合わせる
  const crossMs    = speed
  const frameMs    = Math.round(1000 / crossFps)
  const crossCount = Math.max(minCross, Math.round(crossMs / frameMs))
  // 1フレームの実際の delay
  const actualDelay = Math.round(crossMs / crossCount)

  const frames: { canvas: HTMLCanvasElement; delayMs: number }[] = []

  // left→right, right→left の2方向
  const pairs: Array<['left' | 'right', 'left' | 'right']> = [
    ['left',  'right'],
    ['right', 'left'],
  ]

  for (const [from, to] of pairs) {
    for (let i = 0; i < crossCount; i++) {
      // t: 0 を含まず 1 を含む → (i+1)/crossCount
      // これで「from 100%」フレームがなく、常に合成状態になる
      const t = (i + 1) / crossCount

      const c   = document.createElement('canvas')
      c.width   = w
      c.height  = h
      const ctx = c.getContext('2d')!

      drawCrossfadeFrame(ctx, stereo, from, to, t, w, h)
      frames.push({ canvas: c, delayMs: actualDelay })
    }
  }

  return frames
}

/**
 * useAnimPlayer と同じ合成ロジック:
 * to を不透明で敷き、from を (1-t) の alpha で重ねる
 */
function drawCrossfadeFrame(
  ctx: CanvasRenderingContext2D,
  stereo: StereoImage,
  from: 'left' | 'right',
  to: 'left' | 'right',
  t: number,
  w: number,
  h: number,
) {
  const fromImg = from === 'left' ? stereo.left : stereo.right
  const toImg   = to   === 'left' ? stereo.left : stereo.right

  ctx.clearRect(0, 0, w, h)

  if (t >= 1) {
    // フェーズ完了: to を 100% 表示
    ctx.globalAlpha = 1
    ctx.drawImage(toImg, 0, 0, w, h)
    return
  }

  // to を不透明で敷く → from を (1-t) の alpha で上乗せ
  ctx.globalAlpha = 1
  ctx.drawImage(toImg, 0, 0, w, h)
  ctx.globalAlpha = 1 - t
  ctx.drawImage(fromImg, 0, 0, w, h)
  ctx.globalAlpha = 1
}
