import type { StereoImage, StretchMode } from '../types'
import { renderCrossfadeFrames } from './useFrameRenderer'

/**
 * アニメGIF書き出し（クロスフェード付き）
 * gif.js を CDN から動的ロードしてエンコード
 */
export async function exportGif(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<Blob> {

  await loadGifJs()
  const GIF = (window as any).GIF
  if (!GIF) throw new Error('GIF library failed to load')

  // クロスフェード中間フレームを生成
  const frames = renderCrossfadeFrames(stereo, speed, scale, stretch)

  const first  = frames[0].canvas
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width:   first.width,
      height:  first.height,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
    })

    for (const { canvas, delayMs } of frames) {
      gif.addFrame(canvas, { delay: delayMs, copy: true })
    }

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
