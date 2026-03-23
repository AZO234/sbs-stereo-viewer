import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from './useAnimPlayer'
import { downloadBlob } from './useGifExport'

/**
 * 固定式表示をPNGで書き出し
 * 現在の縮尺・左右配置（swapped含む）を反映した横並び1枚画像
 *
 * @param stereo  立体画像データ
 * @param scale   表示倍率
 * @param stretch 引き伸ばしモード
 * @param swapped 左右入れ替えフラグ
 * @param gap     左右画像の間隔 px（デフォルト 16px）
 */
export async function exportPng(
  stereo: StereoImage,
  scale: number,
  stretch: StretchMode,
  swapped: boolean,
  gap = 16,
): Promise<void> {
  const { w, h } = canvasSize(stereo, scale, stretch)

  const out   = document.createElement('canvas')
  out.width   = w * 2 + gap
  out.height  = h
  const ctx   = out.getContext('2d')!

  const L = swapped ? stereo.right : stereo.left
  const R = swapped ? stereo.left  : stereo.right

  ctx.drawImage(L, 0,         0, w, h)
  ctx.drawImage(R, w + gap,   0, w, h)

  const blob = await new Promise<Blob>((res, rej) =>
    out.toBlob(b => b ? res(b) : rej(new Error('PNG 変換失敗')), 'image/png')
  )

  const base = stereo.fileName.replace(/\.[^.]+$/, '')
  downloadBlob(blob, `${base}_stereo.png`)
}
