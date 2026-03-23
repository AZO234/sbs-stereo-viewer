export type ViewMode = 'anim' | 'fixed'

/** サイドバイサイド方向 */
export type StereoLayout = 'side-by-side' | 'over-under'

/**
 * 表示倍率モード
 *  Wx2 : 1眼を元画像の全幅に引き伸ばす  (SBS 960→1920, 16:9想定)
 *  x1  : 1眼をそのまま等倍表示          (SBS 960×1080, 32:9想定)
 *  Hx2 : 1眼を元画像の全高に引き伸ばす  (O/U 1920×540→1920×1080)
 */
export type StretchMode = 'Wx2' | 'x1' | 'Hx2'

export interface StereoImage {
  left: HTMLCanvasElement
  right: HTMLCanvasElement
  /** 1眼分の幅（元のまま） */
  halfWidth: number
  /** 1眼分の高さ */
  height: number
  /** アスペクト比から推定したデフォルト表示モード */
  defaultStretch: StretchMode
  fileName: string
  originalSize: { w: number; h: number }
  /** 分割方向（横並び or 縦並び） */
  layout: StereoLayout
}

export interface AnimState {
  playing: boolean
  currentEye: 'left' | 'right'
  alpha: number
  lastSwitchTime: number
}
