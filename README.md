[<img src="images/typescript.svg" width="64" alt="TypeScript icon">](https://www.typescriptlang.org/ja/) [<img src="images/vue.svg" width="64" alt="Vue.js icon">](https://ja.vuejs.org/) [<img src="images/bootstrap.svg" width="64" alt="Bootstrap icon">](https://getbootstrap.jp/)

[![BuyMeACoffee](https://img.shields.io/badge/-Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://coff.ee/azo234)

# STEREO VIEWER — JPS/PNS Stereoscopic Image Browser

[<img src="public/screenshots/wide.png" width="960" alt="wide screenshot">]

Vue 3 + TypeScript + Vite + Bootstrap 5 製の立体画像ビューアです。

## 動作要件

- Node.js 18 以上
- npm 9 以上

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ビルド

```bash
npm run build    # dist/ に出力
npm run preview  # ビルド結果のプレビュー
```

## 対応ファイル形式

| 拡張子 | 説明 |
|--------|------|
| `.jps` | JPEG ベースの立体画像（Side-by-Side） |
| `.pns` | PNG ベースの立体画像（Side-by-Side） |
| `.jpg` / `.png` | 通常の Side-by-Side 画像 |

いずれも「左半分＝左目用、右半分＝右目用」の **サイドバイサイド形式** を前提とします。

## 機能

### アニメ式
- 左右の画像をフェードイン/アウトで交互切替
- 切替速度スライダー（50ms〜2000ms）
- 画像サイズスライダー（20%〜200%）
- 再生／停止ボタン

### 固定式
- 左右画像を横並びで表示
- 画像サイズスライダー
- 左右入れ替えトグル

## プロジェクト構成

```
src/
├── main.ts                        # エントリーポイント
├── App.vue                        # ルートコンポーネント
├── style.css                      # グローバルスタイル（デザイントークン）
├── types/
│   └── index.ts                   # 型定義
├── composables/
│   ├── useStereoLoader.ts         # ファイル読み込み・画像分割ロジック
│   └── useAnimPlayer.ts           # requestAnimationFrame アニメループ
└── components/
    ├── AppHeader.vue              # ヘッダー
    ├── DropZone.vue               # ファイルドロップ/選択
    ├── PanelTitle.vue             # サイドバーセクションタイトル
    ├── SliderRow.vue              # スライダー行
    ├── ToggleRow.vue              # トグルスイッチ行
    ├── AnimViewer.vue             # アニメ式キャンバス
    ├── FixedViewer.vue            # 固定式キャンバス（左右並列）
    └── StatusBar.vue              # 下部ステータスバー
```

---

## CI/CD — GitHub Pages / GitLab Pages

### GitHub Pages

| ファイル | `.github/workflows/deploy.yml` |
|----------|-------------------------------|
| トリガー | `main` / `master` へのプッシュ、手動実行 |
| 公開 URL | `https://<USER>.github.io/<REPO>/` |

**初回設定（1度だけ）**

1. リポジトリの **Settings → Pages**
2. Source を **"GitHub Actions"** に変更

それ以降は `main` へプッシュするだけで自動デプロイされます。

---

### GitLab Pages

| ファイル | `.gitlab-ci.yml` |
|----------|-----------------|
| トリガー | `main` / `master` へのプッシュ |
| 公開 URL | `https://<GROUP>.gitlab.io/<PROJECT>/` |

GitLab.com ではリポジトリ作成直後から Pages が利用可能です。  
Self-hosted の場合は **Admin Area → Settings → Pages** を有効化してください。

---

### base パスについて

`vite.config.ts` は環境変数 `VITE_BASE_PATH` を参照します。

| 実行環境 | `VITE_BASE_PATH` | 結果 |
|----------|-----------------|------|
| ローカル (`npm run dev`) | 未設定 | `./`（相対パス） |
| GitHub Actions | `/<REPO>/` | 例: `/stereo-viewer/` |
| GitLab CI | `/<PROJECT>/` | 例: `/stereo-viewer/` |
