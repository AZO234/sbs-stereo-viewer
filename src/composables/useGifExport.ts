import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from './useAnimPlayer'

/**
 * アニメGIF書き出し
 * gif.js を CDN から動的ロードしてエンコード
 *
 * @param stereo   立体画像データ
 * @param speed    切替間隔 ms（1フレームの表示時間）
 * @param scale    表示倍率
 * @param stretch  引き伸ばしモード
 * @param onProgress 進捗コールバック 0〜1
 * @returns        Blob (image/gif)
 */
export async function exportGif(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<Blob> {

  // gif.js を CDN から動的ロード（初回のみ）
  await loadGifJs()

  const GIF = (window as any).GIF
  if (!GIF) throw new Error('GIF library failed to load')

  const { w, h } = canvasSize(stereo, scale, stretch)

  // フレーム描画用オフスクリーンcanvas
  const frame = document.createElement('canvas')
  frame.width  = w
  frame.height = h
  const ctx = frame.getContext('2d')!

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,          // 1=最高品質, 10=バランス
      width: w,
      height: h,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
    })

    // 左フレーム
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(stereo.left, 0, 0, w, h)
    gif.addFrame(frame, { delay: speed, copy: true })

    // 右フレーム
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(stereo.right, 0, 0, w, h)
    gif.addFrame(frame, { delay: speed, copy: true })

    gif.on('progress', (p: number) => onProgress?.(p))
    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.on('error',    (err: unknown) => reject(err))

    gif.render()
  })
}

/** gif.js スクリプトを動的ロード（1度だけ） */
function loadGifJs(): Promise<void> {
  if ((window as any).GIF) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js'
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error('gif.js の読み込みに失敗しました'))
    document.head.appendChild(s)
  })
}

/** Blob をファイルダウンロード */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
