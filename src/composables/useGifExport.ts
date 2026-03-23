import GIF from 'gif.js'
import type { StereoImage, StretchMode } from '../types'
import { renderCrossfadeFrames } from './useFrameRenderer'
import gifWorkerUrl from '/gif.worker.js?url'

/**
 * アニメGIF書き出し（クロスフェード付き）
 * gif.js (npm) を使用
 */
export async function exportGif(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<Blob> {

  const frames = renderCrossfadeFrames(stereo, speed, scale, stretch)
  const first  = frames[0].canvas

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers:      2,
      quality:      10,
      width:        first.width,
      height:       first.height,
      workerScript: gifWorkerUrl,
    })

    for (const { canvas, delayMs } of frames) {
      gif.addFrame(canvas, { delay: delayMs, copy: true })
    }

    gif.on('progress', (p: number) => onProgress?.(p))
    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.render()
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
