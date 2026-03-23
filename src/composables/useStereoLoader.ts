import { ref } from 'vue'
import type { StereoImage, StereoLayout, StretchMode } from '../types'

export function useStereoLoader() {
  const stereo  = ref<StereoImage | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function loadFile(file: File): Promise<void> {
    loading.value = true
    error.value   = null

    try {
      const url = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const w = img.width
          const h = img.height

          // ── レイアウト自動判定（SBS vs O/U） ──────────────────
          const rSide      = (w / 2) / h
          const rOverUnder = w / (h / 2)
          const layout: StereoLayout =
            Math.abs(Math.log(rOverUnder) - Math.log(1.5)) <
            Math.abs(Math.log(rSide)      - Math.log(1.5))
              ? 'over-under'
              : 'side-by-side'

          const tmp = document.createElement('canvas')
          tmp.width = w; tmp.height = h
          tmp.getContext('2d')!.drawImage(img, 0, 0)

          let left: HTMLCanvasElement
          let right: HTMLCanvasElement
          let halfWidth: number
          let halfHeight: number

          if (layout === 'side-by-side') {
            halfWidth  = Math.floor(w / 2)
            halfHeight = h
            const makeHalf = (sx: number): HTMLCanvasElement => {
              const c = document.createElement('canvas')
              c.width = halfWidth; c.height = halfHeight
              c.getContext('2d')!.drawImage(tmp, sx, 0, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
              return c
            }
            left  = makeHalf(0)
            right = makeHalf(halfWidth)
          } else {
            halfWidth  = w
            halfHeight = Math.floor(h / 2)
            const makeHalf = (sy: number): HTMLCanvasElement => {
              const c = document.createElement('canvas')
              c.width = halfWidth; c.height = halfHeight
              c.getContext('2d')!.drawImage(tmp, 0, sy, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight)
              return c
            }
            left  = makeHalf(0)
            right = makeHalf(halfHeight)
          }

          // ── StretchMode 自動推定 ──────────────────────────────
          // 1眼のアスペクト比で判断する
          //   16:9  (≈1.78) → SBS なら Wx2（引き伸ばして全幅）
          //   32:9  (≈3.56) → SBS なら x1（等倍でちょうど16:9）
          //   その他縦長系  → Hx2
          const eyeAspect = halfWidth / halfHeight!
          let defaultStretch: StretchMode
          if (layout === 'side-by-side') {
            if (eyeAspect < 2.5) {
              // 1眼が縦長〜16:9程度 → 全幅に引き伸ばす
              defaultStretch = 'Wx2'
            } else {
              // 1眼が32:9に近い（ほぼ正方形に近い値） → 等倍
              defaultStretch = 'x1'
            }
          } else {
            // O/U は全高引き伸ばしが自然
            defaultStretch = 'Hx2'
          }

          stereo.value = {
            left,
            right,
            halfWidth,
            height: halfHeight!,
            defaultStretch,
            fileName: file.name,
            originalSize: { w, h },
            layout,
          }

          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像の読み込みに失敗しました')) }
        img.src = url
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
    } finally {
      loading.value = false
    }
  }

  return { stereo, loading, error, loadFile }
}
