[<img src="images/typescript.svg" width="64" alt="TypeScript icon">](https://www.typescriptlang.org/ja/) [<img src="images/vite.svg" width="64" alt="Vite.js icon">](https://ja.vite.dev/) [<img src="images/vue.svg" width="64" alt="Vue.js icon">](https://ja.vuejs.org/) [<img src="images/bootstrap.svg" width="64" alt="Bootstrap icon">](https://getbootstrap.jp/)

[![BuyMeACoffee](https://img.shields.io/badge/-Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://coff.ee/azo234)

# STEREO VIEWER

[![Deploy to GitHub Pages](https://github.com/AZO234/stereo-viewer/actions/workflows/deploy.yml/badge.svg)](https://github.com/AZO234/stereo-viewer/actions/workflows/deploy.yml)

**[🔗 デモページ](https://azo234.github.io/stereo-viewer/)**

立体画像（JPS/PNS）の擬似閲覧ウェブビューアです。Vue 3 + TypeScript + Bootstrap 5 で作られています。

![スクリーンショット](public/screenshots/wide.png)
![WebPサンプル](public/sample.webp)

## 機能

- **アニメ式** — 左右画像をクロスフェードで切り替え、速度調整可能
- **固定式** — 左右並列表示、左右入れ替えトグル付き
- **分割方法** — Wide（横分割・SBS）/ Portrait（縦分割・O/U）切り替え
- **表示倍率** — W×2 / ×1 / H×2
- **自動スケール** — 表示幅960px以内（スマホは768px）に自動縮小
- **書き出し** — アニメGIF / アニメWebP / PNG で保存
- **テーマ** — ダーク / ライト 切り替え
- **文字サイズ** — 小 / 中 / 大
- **言語** — 日本語 / 英語 切り替え
- **PWA** — インストール対応、オフライン動作

## 対応フォーマット

| 拡張子 | 説明 |
|--------|------|
| `.jps` | JPEGベースの立体画像（サイドバイサイド） |
| `.pns` | PNGベースの立体画像（サイドバイサイド） |
| `.jpg` / `.png` | 通常のサイドバイサイド立体画像 |

いずれも「左半分＝左目用、右半分＝右目用」のサイドバイサイド形式、または上下分割（Over-Under）形式に対応。

## セットアップ

```bash
pnpm install
pnpm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ビルド

```bash
pnpm run build     # プロダクションビルド → dist/
pnpm run typecheck # TypeScriptの型チェックのみ（高速）
pnpm run preview   # ビルド結果のプレビュー
```

## CI/CD

### GitHub Pages

| ファイル | `.github/workflows/deploy.yml` |
|----------|-------------------------------|
| トリガー | `main` / `master` へのプッシュ、手動実行 |
| 公開 URL | `https://<USER>.github.io/<REPO>/` |

**初回設定（1度だけ）:** Settings → Pages → Source → **「GitHub Actions」** に変更

### GitLab Pages

| ファイル | `.gitlab-ci.yml` |
|----------|-----------------|
| トリガー | `main` / `master` へのプッシュ |
| 公開 URL | `https://<GROUP>.gitlab.io/<PROJECT>/` |

## プロジェクト構成

```
src/
├── main.ts
├── App.vue                          # ルートコンポーネント・全体状態管理
├── style.css                        # デザイントークン・フォントスケール
├── types/index.ts                   # 型定義
├── composables/
│   ├── useI18n.ts                   # 日本語/英語切り替え
│   ├── useAnimPlayer.ts             # rAF クロスフェードアニメ
│   ├── useStereoLoader.ts           # ファイル読込・分割
│   ├── useAutoScale.ts              # 表示幅自動スケール
│   ├── useFrameRenderer.ts          # GIF/WebP 用フレーム生成
│   ├── useGifExport.ts              # アニメGIF書き出し
│   ├── useWebpExport.ts             # アニメWebP書き出し
│   └── usePngExport.ts              # PNG書き出し
└── components/
    ├── AppHeader.vue                # ヘッダー（SNSバー含む）
    ├── DropZone.vue                 # ファイルドロップ/選択
    ├── AnimViewer.vue               # アニメ式ビューア
    ├── FixedViewer.vue              # 固定式ビューア
    ├── LayoutToggle.vue             # Wide / Portrait 切り替え
    ├── StretchToggle.vue            # W×2 / ×1 / H×2 切り替え
    ├── LocaleToggle.vue             # JA / EN 切り替え
    ├── ThemeToggle.vue              # ダーク / ライト 切り替え
    ├── FontSizeToggle.vue           # 文字サイズ切り替え
    ├── SliderRow.vue / ToggleRow.vue / PanelTitle.vue
    └── StatusBar.vue                # 下部ステータスバー
```

## 技術スタック

- [Vue 3](https://vuejs.org/) + Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Bootstrap 5](https://getbootstrap.com/) + Bootstrap Icons
- [gif.js](https://github.com/jnordberg/gif.js)

## ライセンス

MIT © AZO
