<template>
  <header class="sv-header">
    <div class="sv-logo">
      <div class="logo-mark">
        <span /><span /><span /><span />
      </div>
      <div class="logo-text">
        <h1>STEREO VIEWER</h1>
        <small>JPS / PNS STEREOSCOPIC IMAGE BROWSER</small>
      </div>
      <div class="sns-bar">
        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false">ポスト</a>
        <iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2FAZO234.github.io%2Fstereo-viewer&layout&size&width=93&height=20&appId" width="93" height="20" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
        <div class="line-it-button" data-lang="ja" data-type="share-a" data-env="REAL" data-url="https://azo234.github.io/stereo-viewer/" data-color="default" data-size="small" data-count="false" data-ver="3" style="display: none;"></div>
        <a href="https://coff.ee/azo234" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/badge/-Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buymeacoffee&logoColor=black" alt="Buy Me a Coffee">
        </a>
        <a href="https://github.com/sponsors/azo234" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/static/v1?label=Sponsor&message=❤️&logo=github-sponsors&color=lightgrey&style=for-the-badge" alt="Sponsor ❤️">
        </a>
      </div>
    </div>

    <div class="sv-header-right">
      <div class="sv-header-meta" v-if="fileName">
        <i class="bi bi-file-earmark-image me-1" />
        <span class="filename">{{ fileName }}</span>
        <span class="sep">|</span>
        <span class="diminfo">{{ dimInfo }}</span>
      </div>
      <!-- 文字サイズ切替（左） -->
      <FontSizeToggle
        :model-value="fontSize"
        @update:model-value="emit('update:fontSize', $event)"
      />
      <!-- ライト/ダーク切替（右） -->
      <ThemeToggle
        :model-value="isDark"
        @update:model-value="emit('update:isDark', $event)"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import FontSizeToggle from './FontSizeToggle.vue'
import type { FontSize } from './FontSizeToggle.vue'

defineProps<{
  fileName?: string
  dimInfo?:  string
  isDark:    boolean
  fontSize:  FontSize
}>()

const emit = defineEmits<{
  'update:isDark':   [v: boolean]
  'update:fontSize': [v: FontSize]
}>()
</script>

<style scoped>
.sv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.sv-logo { display: flex; align-items: center; gap: 0.9rem; }

.logo-mark {
  width: 32px; height: 32px;
  border: 2px solid var(--accent);
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px; padding: 5px;
  flex-shrink: 0;
}
.logo-mark span { border-radius: 1px; }
.logo-mark span:nth-child(odd)  { background: var(--accent); }
.logo-mark span:nth-child(even) { background: var(--accent2); }

h1 {
  font-family: var(--mono);
  font-size: 1rem;
  letter-spacing: 0.12em;
  color: var(--accent);
  line-height: 1;
}
small {
  display: block;
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin-top: 3px;
}

.sv-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sv-header-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}
.filename { color: var(--text); }
.sep { opacity: 0.3; }
.diminfo { color: var(--accent); }
</style>
