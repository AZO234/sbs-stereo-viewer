<template>
  <div class="sv-app">
    <AppHeader
      :file-name="stereo?.fileName"
      :dim-info="dimInfo"
      :is-dark="isDark"
      :font-size="fontSize"
      @update:is-dark="isDark = $event"
      @update:font-size="fontSize = $event"
    />
    <!-- 右下固定の著作権表示 -->
    <div class="sv-copyright">©AZO</div>

    <div class="sv-body">
      <!-- ── MAIN（左：画像ビューア） ── -->
      <main class="sv-main" ref="mainEl">

        <div v-if="!stereo && !loading" class="empty-state">
          <div class="empty-icon">🎞️</div>
          <p>JPS / PNS ファイルを読み込んでください</p>
          <p class="empty-sub">サイドバイサイド形式の立体画像に対応</p>
        </div>

        <div v-else-if="loading" class="empty-state">
          <div class="sv-spinner" />
          <p>読み込み中...</p>
        </div>

        <template v-else-if="stereo">
          <AnimViewer
            v-show="mode === 'anim'"
            ref="animViewerRef"
            :stereo="stereo"
            :speed="animSpeed"
            :scale="finalAnimScale"
            :stretch="stretchMode"
            v-model:playing="animPlaying"
            @frame="currentFrame = $event"
          />
          <FixedViewer
            v-show="mode === 'fixed'"
            :stereo="stereo"
            :scale="finalFixedScale"
            :stretch="stretchMode"
            :swapped="swapped"
          />
        </template>

        <StatusBar
          :size="dimInfo ?? '—'"
          :mode="mode === 'anim' ? 'ANIM' : 'FIXED'"
          :frame="mode === 'anim' ? (currentFrame === 'left' ? 'L' : 'R') : '—'"
          :scale="mode === 'anim' ? `${animScalePct}%` : `${fixedScalePct}%`"
          :layout="stereo ? (stereo.layout === 'side-by-side' ? 'SBS' : 'O/U') : undefined"
          :stretch="stretchMode"
        />
      </main>

      <!-- ── SIDEBAR（右：UI） ── -->
      <aside class="sv-sidebar">

        <!-- File Drop -->
        <section>
          <PanelTitle>ファイル</PanelTitle>
          <DropZone @file="onFile" />
          <div v-if="error" class="sv-error mt-2">
            <i class="bi bi-exclamation-triangle me-1" />{{ error }}
          </div>
        </section>

        <!-- Mode Tabs -->
        <section>
          <PanelTitle>表示モード</PanelTitle>
          <div class="mode-tabs">
            <button class="mode-tab" :class="{ active: mode === 'anim' }"  @click="setMode('anim')">アニメ式</button>
            <button class="mode-tab" :class="{ active: mode === 'fixed' }" @click="setMode('fixed')">固定式</button>
          </div>
        </section>

        <!-- 表示倍率（共通） -->
        <section>
          <PanelTitle>表示倍率</PanelTitle>
          <StretchToggle v-model="stretchMode" />
          <p class="stretch-hint">{{ stretchHint }}</p>
        </section>

        <!-- Anim Controls -->
        <section v-show="mode === 'anim'">
          <PanelTitle>アニメ設定</PanelTitle>
          <div class="ctrl-group">
            <SliderRow
              label="切替速度"
              v-model="animSpeed"
              :min="50" :max="2000" :step="50"
              :display-value="`${animSpeed} ms`"
            />
            <SliderRow
              label="画像サイズ"
              v-model="animScalePct"
              :min="20" :max="200" :step="5"
              :display-value="`${animScalePct} %`"
            />
            <button
              class="sv-play-btn"
              :class="{ playing: animPlaying }"
              :disabled="!stereo"
              @click="togglePlay"
            >
              <span class="dot" />
              <span>{{ animPlaying ? '停止' : '再生' }}</span>
            </button>
          </div>
        </section>

        <!-- Fixed Controls -->
        <section v-show="mode === 'fixed'">
          <PanelTitle>固定式設定</PanelTitle>
          <div class="ctrl-group">
            <SliderRow
              label="画像サイズ"
              v-model="fixedScalePct"
              :min="20" :max="200" :step="5"
              :display-value="`${fixedScalePct} %`"
            />
            <ToggleRow label="左右入れ替え" v-model="swapped" />
          </div>
        </section>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ViewMode, StretchMode } from './types'
import { useAutoScale } from './composables/useAutoScale'
import type { FontSize } from './components/FontSizeToggle.vue'
import { useStereoLoader } from './composables/useStereoLoader'

import AppHeader     from './components/AppHeader.vue'
import DropZone      from './components/DropZone.vue'
import PanelTitle    from './components/PanelTitle.vue'
import SliderRow     from './components/SliderRow.vue'
import ToggleRow     from './components/ToggleRow.vue'
import StretchToggle from './components/StretchToggle.vue'
import AnimViewer    from './components/AnimViewer.vue'
import FixedViewer   from './components/FixedViewer.vue'
import StatusBar     from './components/StatusBar.vue'

// ── Theme ────────────────────────────────────────────────────
const isDark = ref(true)
watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}, { immediate: true })

// ── Main container ref（自動スケール用） ──────────────────────
const mainEl = ref<HTMLElement | null>(null)

// ── Font size ─────────────────────────────────────────────────
const fontSize = ref<FontSize>('md')
watch(fontSize, (s) => {
  document.documentElement.setAttribute('data-font', s)
}, { immediate: true })

// ── Stereo loader ─────────────────────────────────────────────
const { stereo, loading, error, loadFile } = useStereoLoader()

// ── Mode ──────────────────────────────────────────────────────
const mode = ref<ViewMode>('anim')
function setMode(m: ViewMode) {
  if (animPlaying.value) animPlaying.value = false
  mode.value = m
}

// ── Stretch mode ──────────────────────────────────────────────
const stretchMode = ref<StretchMode>('Wx2')

// 画像ロード時にアスペクト比から自動選択
watch(stereo, (s) => {
  if (s) stretchMode.value = s.defaultStretch
})

const stretchHint = computed(() => {
  switch (stretchMode.value) {
    case 'Wx2': return '1眼 → 全幅へ引き伸ばし'
    case 'x1':  return '1眼をそのまま等倍表示'
    case 'Hx2': return '1眼 → 全高へ引き伸ばし'
  }
})

// ── Auto scale（stretchMode / mode 確定後に初期化） ─────────────
const { autoScale } = useAutoScale(mainEl, stereo, stretchMode, mode)

// ── Anim controls ─────────────────────────────────────────────
const animSpeed    = ref(100)
const animScalePct = ref(100)
// 自動スケール × 手動スケールを合成
const finalAnimScale  = computed(() => autoScale.value * animScalePct.value / 100)
const finalFixedScale = computed(() => autoScale.value * fixedScalePct.value / 100)

const animPlaying  = ref(false)
const currentFrame = ref<string>('left')
const animViewerRef = ref<InstanceType<typeof AnimViewer> | null>(null)

function togglePlay() { animPlaying.value = !animPlaying.value }

// ── Fixed controls ────────────────────────────────────────────
const fixedScalePct = ref(100)
const swapped       = ref(false)

// ── File handler ──────────────────────────────────────────────
async function onFile(file: File) {
  animPlaying.value = false
  await loadFile(file)
}

// ── Derived info ──────────────────────────────────────────────
const dimInfo = computed(() => {
  if (!stereo.value) return undefined
  const { originalSize: o, halfWidth: hw, height: h, layout } = stereo.value
  return layout === 'side-by-side'
    ? `SBS ${o.w}×${o.h} (${hw}×${h} → ${o.w}×${o.h})`
    : `O/U ${o.w}×${o.h} (${hw}×${Math.floor(o.h/2)} → ${o.w}×${o.h})`
})
</script>

<style scoped>
.sv-app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.sv-body { display: grid; grid-template-columns: 1fr 290px; flex: 1; overflow: hidden; }

.sv-sidebar {
  background: var(--surface);
  border-left: 1px solid var(--border);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.mode-tabs { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.mode-tab { padding: 0.55rem; background: transparent; border: none; color: var(--text-muted); font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.04em; cursor: pointer; transition: background var(--transition), color var(--transition); }
.mode-tab.active { background: var(--accent); color: #000; font-weight: 700; }
.mode-tab:not(.active):hover { background: var(--surface2); color: var(--text); }

.stretch-hint {
  margin-top: 0.4rem;
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: var(--mono);
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.ctrl-group { display: flex; flex-direction: column; gap: 0.85rem; }

.sv-play-btn {
  width: 100%; padding: 0.6rem;
  border: 1px solid var(--accent); background: transparent; color: var(--accent);
  font-family: var(--mono); font-size: 0.78rem; letter-spacing: 0.12em;
  border-radius: var(--radius); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: background var(--transition), color var(--transition);
}
.sv-play-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.sv-play-btn:not(:disabled):hover, .sv-play-btn.playing { background: var(--accent); color: #000; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.sv-play-btn.playing .dot { animation: blink 0.8s infinite; }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.15 } }

.sv-main {
  background: var(--bg);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1.5rem 1.5rem 2.5rem;
  position: relative; overflow: hidden;
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-muted); text-align: center; }
.empty-icon { font-size: 4rem; opacity: 0.18; }
.empty-state p { font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.1em; }
.empty-sub { opacity: 0.45; font-size: 0.65rem !important; }

.sv-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.sv-error { font-size: 0.72rem; color: var(--accent2); background: rgba(255,61,107,0.08); border: 1px solid rgba(255,61,107,0.3); border-radius: var(--radius); padding: 0.4rem 0.6rem; }

.sv-copyright {
  position: fixed;
  bottom: 2.2rem; /* StatusBar の上 */
  right: 0.8rem;
  font-family: var(--mono);
  font-size: 0.65rem;
  color: var(--text);
  opacity: 0.45;
  letter-spacing: 0.08em;
  pointer-events: none;
  z-index: 100;
}

@media (max-width: 768px) {
  .sv-body { grid-template-columns: 1fr; grid-template-rows: 1fr auto; }
  .sv-sidebar { border-left: none; border-top: 1px solid var(--border); order: 2; }
  .sv-main { order: 1; }
}
</style>
