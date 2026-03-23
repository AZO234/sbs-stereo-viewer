import { ref, readonly, computed } from 'vue'

export type Locale = 'ja' | 'en'

const messages = {
  ja: {
    // サイドバー セクション
    file:           'ファイル',
    splitMethod:    '分割方法',
    viewMode:       '表示モード',
    stretch:        '表示倍率',
    animSettings:   'アニメ設定',
    fixedSettings:  '固定式設定',

    // モードタブ
    animMode:   'アニメ式',
    fixedMode:  '固定式',

    // DropZone
    dropOrClick: 'クリックまたはドロップ',
    tapToSelect: 'タップして選択',
    sbs:         'サイドバイサイド形式の立体画像に対応',
    loadPrompt:  'JPS / PNS ファイルを読み込んでください',

    // スライダー
    speed:     '切替速度',
    imageSize: '画像サイズ',

    // ボタン
    play:  '再生',
    stop:  '停止',
    swap:  '左右入れ替え',

    // StretchToggle ヒント
    stretchWx2: '1眼 → 全幅へ引き伸ばし',
    stretchX1:  '1眼をそのまま等倍表示',
    stretchHx2: '1眼 → 全高へ引き伸ばし',

    // StretchToggle tooltip
    stretchWx2Tip: '1眼を元の全幅に引き伸ばす（SBS 16:9向け）',
    stretchX1Tip:  '1眼をそのまま等倍表示（SBS 32:9向け）',
    stretchHx2Tip: '1眼を元の全高に引き伸ばす（O/U向け）',

    // LayoutToggle
    wideTip:     'Wide: 幅の中央で左右分割（SBS）',
    portraitTip: 'Portrait: 高さの中央で上下分割（O/U）',

    // 保存ボタン
    saveGif:  'GIFで保存',
    saveWebp: 'WebPで保存',
    savePng:  'PNGで保存',
    saving:   '保存中…',
    encodingGif:  'GIF…',
    encodingWebp: 'WebP…',

    // エラー
    loadError:    '画像の読み込みに失敗しました',
    gifError:     'GIF書き出しに失敗しました: ',
    webpError:    'WebP書き出しに失敗しました: ',
    pngError:     'PNG書き出しに失敗しました: ',

    // ステータス
    loading: '読み込み中...',

    // ThemeToggle
    toDark:  'ダークモードへ',
    toLight: 'ライトモードへ',

    // FontSizeToggle
    fontSm: '小',
    fontMd: '中',
    fontLg: '大',
    fontSizeLabel: (s: string) => `文字サイズ${s}`,

    // 眼ラベル
    leftLabel:    'LEFT',
    rightLabel:   'RIGHT',
    leftSwapped:  'RIGHT → LEFT',
    rightSwapped: 'LEFT → RIGHT',
  },
  en: {
    file:           'File',
    splitMethod:    'Split',
    viewMode:       'View Mode',
    stretch:        'Stretch',
    animSettings:   'Anim Settings',
    fixedSettings:  'Fixed Settings',

    animMode:   'Animate',
    fixedMode:  'Fixed',

    dropOrClick: 'Click or Drop',
    tapToSelect: 'Tap to select',
    sbs:         'Supports side-by-side stereo images',
    loadPrompt:  'Load a JPS / PNS file',

    speed:     'Speed',
    imageSize: 'Size',

    play:  'Play',
    stop:  'Stop',
    swap:  'Swap L/R',

    stretchWx2: 'Stretch → full width',
    stretchX1:  '1:1 (no stretch)',
    stretchHx2: 'Stretch → full height',

    stretchWx2Tip: 'Stretch each eye to original full width (SBS 16:9)',
    stretchX1Tip:  'Display each eye at 1:1 (SBS 32:9)',
    stretchHx2Tip: 'Stretch each eye to original full height (O/U)',

    wideTip:     'Wide: split at horizontal center (SBS)',
    portraitTip: 'Portrait: split at vertical center (O/U)',

    saveGif:  'Save GIF',
    saveWebp: 'Save WebP',
    savePng:  'Save PNG',
    saving:   'Saving…',
    encodingGif:  'GIF…',
    encodingWebp: 'WebP…',

    loadError:    'Failed to load image',
    gifError:     'GIF export failed: ',
    webpError:    'WebP export failed: ',
    pngError:     'PNG export failed: ',

    loading: 'Loading...',

    toDark:  'Switch to dark mode',
    toLight: 'Switch to light mode',

    fontSm: 'S',
    fontMd: 'M',
    fontLg: 'L',
    fontSizeLabel: (s: string) => `Font size ${s}`,

    leftLabel:    'LEFT',
    rightLabel:   'RIGHT',
    leftSwapped:  'RIGHT → LEFT',
    rightSwapped: 'LEFT → RIGHT',
  },
} as const

// アプリ全体でシングルトンとして共有
const locale = ref<Locale>('ja')

export function useI18n() {
  const t = computed(() => messages[locale.value])

  function setLocale(l: Locale) {
    locale.value = l
    document.documentElement.setAttribute('lang', l)
    localStorage.setItem('sv-locale', l)
  }

  function initLocale() {
    const saved = localStorage.getItem('sv-locale') as Locale | null
    if (saved === 'ja' || saved === 'en') setLocale(saved)
    else setLocale('ja')
  }

  return {
    locale: readonly(locale),
    t,
    setLocale,
    initLocale,
  }
}
