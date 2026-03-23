import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { StereoImage, StretchMode } from '../types'
import { canvasSize } from './useAnimPlayer'

/**
 * sv-main 要素の幅を監視し、画像が収まるよう autoScale を返す。
 *
 * アニメ式: 画像1枚分の自然幅が maxW 以下に収まるスケール
 * 固定式  : 左右2枚 + gap の合計幅が maxW 以下に収まるスケール
 *
 * @param containerRef  監視対象の HTMLElement ref
 * @param stereo        現在の立体画像（null 可）
 * @param stretch       引き伸ばしモード
 * @param mode          'anim' | 'fixed'
 * @param breakpoint    スマホ判定幅 px（デフォルト 768）
 * @param pcMaxW        PC 時の最大幅 px（デフォルト 960）
 * @param spMaxW        スマホ時の最大幅 px（デフォルト 768）
 * @param fixedGap      固定式の左右間隔 px（デフォルト 24）
 */
export function useAutoScale(
  containerRef: ReturnType<typeof ref<HTMLElement | null>>,
  stereo: ReturnType<typeof ref<StereoImage | null>>,
  stretch: ReturnType<typeof ref<StretchMode>>,
  mode: ReturnType<typeof ref<string>>,
  {
    breakpoint = 768,
    pcMaxW     = 960,
    spMaxW     = 768,
    fixedGap   = 24,
  } = {},
) {
  const autoScale = ref(1.0)

  function recalc() {
    if (!stereo.value) { autoScale.value = 1.0; return }
    if (!containerRef.value) { autoScale.value = 1.0; return }

    // コンテナの実際の内幅（padding 除く）
    const containerW = containerRef.value.clientWidth
    const maxW = containerW < breakpoint ? spMaxW : pcMaxW
    // コンテナ自体が maxW より狭い場合はコンテナ幅に従う
    const limit = Math.min(maxW, containerW - 32)  // 32px は左右余白

    // scale=1 の自然幅
    const { w: naturalW } = canvasSize(stereo.value, 1.0, stretch.value)

    // 固定式は2枚分
    const totalNatural = mode.value === 'fixed'
      ? naturalW * 2 + fixedGap
      : naturalW

    autoScale.value = totalNatural > limit
      ? limit / totalNatural
      : 1.0  // 収まるなら縮小しない（拡大もしない）
  }

  // ResizeObserver でコンテナ幅の変化を監視
  let ro: ResizeObserver | null = null

  function connect() {
    if (!containerRef.value) return
    ro?.disconnect()
    ro = new ResizeObserver(recalc)
    ro.observe(containerRef.value)
    recalc()
  }

  onMounted(connect)
  onUnmounted(() => ro?.disconnect())

  // stereo / stretch / mode 変化でも再計算
  watch([stereo, stretch, mode], recalc)
  // containerRef がセットされた後も再計算
  watch(containerRef, connect)

  return { autoScale }
}
