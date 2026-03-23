import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from './useAnimPlayer'
import { downloadBlob } from './useGifExport'

/**
 * アニメWebP書き出し
 *
 * WebP アニメーションは RIFF コンテナ形式:
 *   RIFF....WEBP
 *     VP8X.... (拡張ヘッダー: アニメフラグ)
 *     ANIM.... (アニメグローバルパラメータ)
 *     ANMF.... (フレーム1: VP8/VP8L チャンク内包)
 *     ANMF.... (フレーム2)
 *     ...
 *
 * 各フレームは Canvas.toBlob('image/webp') で生成した
 * WebP バイトから VP8X を除いたペイロードを流用する。
 */
export async function exportWebp(
  stereo: StereoImage,
  speed: number,
  scale: number,
  stretch: StretchMode,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const { w, h } = canvasSize(stereo, scale, stretch)

  // 1. 各フレームを静止画 WebP Blob として取得
  const images = [stereo.left, stereo.right]
  const frameBlobs: ArrayBuffer[] = []

  for (let i = 0; i < images.length; i++) {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    c.getContext('2d')!.drawImage(images[i], 0, 0, w, h)
    const buf = await canvasToWebpBuffer(c)
    frameBlobs.push(buf)
    onProgress?.((i + 1) / images.length * 0.8)
  }

  // 2. アニメWebP バイナリを組み立てる
  const blob = buildAnimWebp(frameBlobs, w, h, speed)
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
      0.92,  // quality
    )
  })
}

/**
 * RIFF/WEBP アニメーションバイナリを構築
 *
 * 参考仕様: https://developers.google.com/speed/webp/docs/riff_container
 */
function buildAnimWebp(
  frameBuffers: ArrayBuffer[],
  width: number,
  height: number,
  delayMs: number,
): Blob {
  const chunks: Uint8Array[] = []

  // ── VP8X チャンク (10バイト payload) ──────────────────────
  // flags: bit1=animation, bit4=alpha(任意)
  const vp8xFlags = 0b00000010  // animation flag
  const vp8xPayload = new Uint8Array(10)
  const vp8xView = new DataView(vp8xPayload.buffer)
  vp8xView.setUint8(0, vp8xFlags)
  // canvas width-1 (24bit LE), canvas height-1 (24bit LE)
  setUint24LE(vp8xView, 4, width  - 1)
  setUint24LE(vp8xView, 7, height - 1)
  chunks.push(makeChunk('VP8X', vp8xPayload))

  // ── ANIM チャンク (6バイト payload) ───────────────────────
  // background color (RGBA LE) + loop count (0=infinite)
  const animPayload = new Uint8Array(6)
  const animView = new DataView(animPayload.buffer)
  animView.setUint32(0, 0x00000000, true)  // background: transparent black
  animView.setUint16(4, 0, true)            // loop count = 0 (infinite)
  chunks.push(makeChunk('ANIM', animPayload))

  // ── ANMF チャンク × フレーム数 ───────────────────────────
  for (const frameBuf of frameBuffers) {
    // 静止画 WebP から VP8/VP8L チャンクを抽出
    const innerChunk = extractInnerChunk(frameBuf)
    if (!innerChunk) throw new Error('Failed to parse WebP frame')

    // ANMF payload:
    //   frame X (24bit LE, /2)
    //   frame Y (24bit LE, /2)
    //   frame width-1  (24bit LE)
    //   frame height-1 (24bit LE)
    //   duration (24bit LE, ms)
    //   flags (8bit): 0=no blend/no dispose
    //   frame data (VP8/VP8L chunk)
    const headerSize  = 16
    const frameData   = innerChunk
    const anmfPayload = new Uint8Array(headerSize + frameData.length + (frameData.length & 1))
    const anmfView    = new DataView(anmfPayload.buffer)

    setUint24LE(anmfView, 0, 0)              // frame X
    setUint24LE(anmfView, 3, 0)              // frame Y
    setUint24LE(anmfView, 6, width  - 1)     // frame W - 1
    setUint24LE(anmfView, 9, height - 1)     // frame H - 1
    setUint24LE(anmfView, 12, delayMs)        // duration
    anmfView.setUint8(15, 0)                  // flags

    anmfPayload.set(frameData, headerSize)
    chunks.push(makeChunk('ANMF', anmfPayload))
  }

  // ── RIFF ヘッダーで全体を包む ─────────────────────────────
  const totalInner = chunks.reduce((s, c) => s + c.length, 0)
  // RIFF ヘッダー: "RIFF" + size(4) + "WEBP"
  const riffHeader = new Uint8Array(12)
  const riffView   = new DataView(riffHeader.buffer)
  riffHeader[0] = 0x52; riffHeader[1] = 0x49  // R I
  riffHeader[2] = 0x46; riffHeader[3] = 0x46  // F F
  riffView.setUint32(4, totalInner + 4, true)  // size (後ろの WEBP + chunks)
  riffHeader[8]  = 0x57; riffHeader[9]  = 0x45 // W E
  riffHeader[10] = 0x42; riffHeader[11] = 0x50 // B P

  return new Blob([riffHeader, ...chunks], { type: 'image/webp' })
}

/** 4文字FourCC + payload → チャンクバイト列 */
function makeChunk(fourcc: string, payload: Uint8Array): Uint8Array {
  const padded    = payload.length + (payload.length & 1)  // 偶数バイト padding
  const chunk     = new Uint8Array(8 + padded)
  const view      = new DataView(chunk.buffer)
  for (let i = 0; i < 4; i++) chunk[i] = fourcc.charCodeAt(i)
  view.setUint32(4, payload.length, true)
  chunk.set(payload, 8)
  return chunk
}

/** 24bit little-endian 書き込み */
function setUint24LE(view: DataView, offset: number, value: number) {
  view.setUint8(offset,     value & 0xFF)
  view.setUint8(offset + 1, (value >> 8)  & 0xFF)
  view.setUint8(offset + 2, (value >> 16) & 0xFF)
}

/**
 * 静止画 WebP バイト列から VP8 / VP8L / VP8X チャンクを取り出す。
 * ANMF の frame data として使うには VP8 か VP8L チャンクそのものが必要。
 * VP8X を持つ場合は内部の VP8/VP8L を再帰的に探す。
 */
function extractInnerChunk(buf: ArrayBuffer): Uint8Array | null {
  const data = new Uint8Array(buf)
  const view = new DataView(buf)

  // "RIFF" チェック
  if (data[0] !== 0x52 || data[1] !== 0x49) return null

  // RIFF ペイロード先頭 (offset 12) からチャンクを走査
  let offset = 12
  while (offset + 8 <= buf.byteLength) {
    const id   = String.fromCharCode(data[offset], data[offset+1], data[offset+2], data[offset+3])
    const size = view.getUint32(offset + 4, true)
    const nextOffset = offset + 8 + size + (size & 1)

    if (id === 'VP8 ' || id === 'VP8L') {
      // VP8/VP8L チャンク全体（FourCC + size + payload）を返す
      return data.slice(offset, offset + 8 + size)
    }
    // VP8X は中に VP8/VP8L が続くので読み飛ばして次へ
    offset = nextOffset
  }
  return null
}

/** アニメWebP書き出しエントリ */
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
