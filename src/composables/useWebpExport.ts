import type { StereoImage, StretchMode } from '../types'
import { renderCrossfadeFrames } from './useFrameRenderer'
import { downloadBlob } from './useGifExport'

/**
 * アニメWebP書き出し（クロスフェード付き）
 * RIFF/WEBP コンテナを手組みしてバイナリ生成
 */
export async function exportWebp(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<Blob> {

  // クロスフェード中間フレームを生成
  const frames = renderCrossfadeFrames(stereo, speed, scale, stretch)
  const { w, h } = { w: frames[0].canvas.width, h: frames[0].canvas.height }

  // 各フレームを静止画 WebP ArrayBuffer に変換
  const frameBuffers: { buf: ArrayBuffer; delayMs: number }[] = []
  for (let i = 0; i < frames.length; i++) {
    const buf = await canvasToWebpBuffer(frames[i].canvas)
    frameBuffers.push({ buf, delayMs: frames[i].delayMs })
    onProgress?.((i + 1) / frames.length * 0.85)
  }

  const blob = buildAnimWebp(frameBuffers, w, h)
  onProgress?.(1.0)
  return blob
}

/** canvas → WebP ArrayBuffer */
function canvasToWebpBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('WebP frame encode failed')); return }
        blob.arrayBuffer().then(resolve).catch(reject)
      },
      'image/webp',
      0.92,
    )
  })
}

/**
 * RIFF/WEBP アニメーションバイナリを構築
 * 参考: https://developers.google.com/speed/webp/docs/riff_container
 */
function buildAnimWebp(
  frames: { buf: ArrayBuffer; delayMs: number }[],
  width: number,
  height: number,
): Blob {
  const chunks: Uint8Array[] = []

  // VP8X チャンク
  const vp8xPayload = new Uint8Array(10)
  const vp8xView    = new DataView(vp8xPayload.buffer)
  vp8xView.setUint8(0, 0b00000010)       // animation flag
  setUint24LE(vp8xView, 4, width  - 1)
  setUint24LE(vp8xView, 7, height - 1)
  chunks.push(makeChunk('VP8X', vp8xPayload))

  // ANIM チャンク
  const animPayload = new Uint8Array(6)
  const animView    = new DataView(animPayload.buffer)
  animView.setUint32(0, 0x00000000, true) // background: transparent
  animView.setUint16(4, 0, true)           // loop = infinite
  chunks.push(makeChunk('ANIM', animPayload))

  // ANMF チャンク × フレーム数
  for (const { buf, delayMs } of frames) {
    const innerChunk = extractInnerChunk(buf)
    if (!innerChunk) throw new Error('Failed to parse WebP frame')

    const headerSize  = 16
    const anmfPayload = new Uint8Array(headerSize + innerChunk.length + (innerChunk.length & 1))
    const anmfView    = new DataView(anmfPayload.buffer)

    setUint24LE(anmfView, 0,  0)
    setUint24LE(anmfView, 3,  0)
    setUint24LE(anmfView, 6,  width  - 1)
    setUint24LE(anmfView, 9,  height - 1)
    setUint24LE(anmfView, 12, delayMs)
    anmfView.setUint8(15, 0)

    anmfPayload.set(innerChunk, headerSize)
    chunks.push(makeChunk('ANMF', anmfPayload))
  }

  // RIFF ヘッダー
  const totalInner = chunks.reduce((s, c) => s + c.length, 0)
  const riffHeader = new Uint8Array(12)
  const riffView   = new DataView(riffHeader.buffer)
  riffHeader.set([0x52,0x49,0x46,0x46], 0) // RIFF
  riffView.setUint32(4, totalInner + 4, true)
  riffHeader.set([0x57,0x45,0x42,0x50], 8) // WEBP

  return new Blob([riffHeader, ...chunks], { type: 'image/webp' })
}

function makeChunk(fourcc: string, payload: Uint8Array): Uint8Array {
  const padded = payload.length + (payload.length & 1)
  const chunk  = new Uint8Array(8 + padded)
  const view   = new DataView(chunk.buffer)
  for (let i = 0; i < 4; i++) chunk[i] = fourcc.charCodeAt(i)
  view.setUint32(4, payload.length, true)
  chunk.set(payload, 8)
  return chunk
}

function setUint24LE(view: DataView, offset: number, value: number) {
  view.setUint8(offset,     value         & 0xFF)
  view.setUint8(offset + 1, (value >> 8)  & 0xFF)
  view.setUint8(offset + 2, (value >> 16) & 0xFF)
}

function extractInnerChunk(buf: ArrayBuffer): Uint8Array | null {
  const data = new Uint8Array(buf)
  const view = new DataView(buf)
  if (data[0] !== 0x52 || data[1] !== 0x49) return null
  let offset = 12
  while (offset + 8 <= buf.byteLength) {
    const id   = String.fromCharCode(data[offset], data[offset+1], data[offset+2], data[offset+3])
    const size = view.getUint32(offset + 4, true)
    if (id === 'VP8 ' || id === 'VP8L') {
      return data.slice(offset, offset + 8 + size)
    }
    offset += 8 + size + (size & 1)
  }
  return null
}

export async function saveAnimWebp(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<void> {
  const blob = await exportWebp(stereo, speed, scale, stretch, onProgress)
  const base = stereo.fileName.replace(/\.[^.]+$/, '')
  downloadBlob(blob, `${base}_anim.webp`)
}
