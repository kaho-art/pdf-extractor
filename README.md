# OCR Studio 📖

日本語の縦書き・多段組みPDF/画像からテキストを抽出するWebアプリです。

## 機能

- ✅ PDF / JPG / PNG アップロード対応
- ✅ 縦書き・横書き・自動判定
- ✅ 1〜3段組み / 自動判定
- ✅ BBox付きOCR（テキストクリックで画像ハイライト）
- ✅ プレーンテキスト / Markdown / JSON 出力
- ✅ ルビ除去
- ✅ コピー・ファイル保存

## セットアップ

```bash
git clone https://github.com/your-username/ocr-app.git
cd ocr-app
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## OCRエンジン切り替え

`.env.local` の `NEXT_PUBLIC_OCR_ENGINE` を変更します。

### Tesseract.js（デフォルト・無料）

```env
NEXT_PUBLIC_OCR_ENGINE=tesseract
```

追加設定不要。ブラウザ内で動作します。

### Google Vision API

```env
NEXT_PUBLIC_OCR_ENGINE=google-vision
GOOGLE_VISION_API_KEY=your_key_here
```

`src/lib/ocr/google-vision.ts` を実装して `useOCR.ts` で切り替えてください。

### Azure Computer Vision

```env
NEXT_PUBLIC_OCR_ENGINE=azure
AZURE_CV_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_CV_KEY=your_key_here
```

`src/lib/ocr/azure.ts` を実装して `useOCR.ts` で切り替えてください。

## Vercelデプロイ

1. GitHubにpush
2. [vercel.com](https://vercel.com) でリポジトリをインポート
3. 環境変数を設定（`.env.example` 参照）
4. Deploy ボタンをクリック

## レイアウト解析アルゴリズム

`src/lib/layout-analysis/index.ts` に実装：

1. **BBox取得** — OCRエンジンから座標付き結果を取得
2. **行クラスタリング** — 近接する行をグループ化
3. **段組み推定** — X座標ヒストグラムで段数を推定
4. **読み方向判定** — BBoxの縦横比で縦書き/横書きを判定
5. **読み順ソート** — 段 → 縦/横位置 でソート
6. **テキスト結合** — ブロック単位でテキスト生成

## 技術スタック

- **Frontend**: Next.js 14 (App Router) / TypeScript / TailwindCSS
- **PDF処理**: pdf.js
- **OCR**: Tesseract.js (デフォルト)
- **デプロイ**: Vercel
