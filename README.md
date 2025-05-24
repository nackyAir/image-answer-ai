# AI 画像問題回答システム

PDF資料を解析し、チャット形式で画像の問題に対してAIが回答するWebアプリケーションです。

## 機能

- **PDFアップロード**: 教材や参考資料のPDFファイルをアップロード
- **PDF内容解析**: OpenAI GPT-4oによるPDFの内容の構造化と要約
- **チャット形式UI**: 自然な会話形式で複数の問題を順次質問
- **画像問題回答**: アップロードした画像の問題をPDFの内容を基に回答
- **メッセージ履歴**: 全ての質問と回答の履歴を保持
- **リアルタイムフィードバック**: 処理状況の表示とエラーハンドリング

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **プログラミング言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI API**: OpenAI GPT-4o
- **PDF処理**: pdf-parse
- **ファイルアップロード**: react-dropzone
- **アイコン**: Lucide React

## セットアップ

### 前提条件

- Node.js 18以上
- OpenAI API Key

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd image-answer-ai
```

2. 依存関係をインストール
```bash
npm install
# または
bun install
```

3. 環境変数を設定

`.env.local`ファイルを作成してOpenAI API Keyを設定:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 開発サーバーの起動

```bash
npm run dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスします。

## 使用方法

### 1. PDFアップロード
- アプリケーション起動時に表示されるアップロード画面でPDFファイルを選択
- ドラッグ&ドロップまたはクリックしてファイルを選択
- AIが自動的にPDFの内容を解析・構造化

### 2. チャット開始
- PDFの解析が完了すると、チャット画面に移行
- システムメッセージで解析完了を通知

### 3. 問題画像の送信
- チャット入力欄の📎ボタンをクリックして画像を添付
- または、ドラッグ&ドロップで画像を追加
- テキストメッセージと併せて送信

### 4. AI回答の確認
- PDFの内容を参考にした詳細な回答が表示
- 複数の問題を順次送信可能
- 全ての履歴がチャット形式で保持

### 5. セッションリセット
- ヘッダーの「新しいセッション」ボタンで新しいPDFでの分析を開始

## チャット機能

- **メッセージタイプ**:
  - 🔵 ユーザー（青）: 送信したメッセージと画像
  - 🟢 AI（緑）: AIからの回答
  - ⚪ システム（グレー）: 分析状況やエラー通知

- **ファイル対応**:
  - PDF: 最初のアップロード時のみ
  - 画像: JPG、PNG、WebP形式をサポート

- **操作方法**:
  - Enter: メッセージ送信
  - Shift+Enter: 改行
  - 📎ボタン: ファイル添付

## API エンドポイント

### POST /api/analyze-pdf
PDFファイルを解析します。

**リクエスト**:
- `pdf`: PDFファイル (multipart/form-data)

**レスポンス**:
```json
{
  "success": true,
  "originalText": "PDFの原文",
  "analysis": "AIによる解析結果",
  "wordCount": 1234
}
```

### POST /api/answer-question
画像の問題に回答します。

**リクエスト**:
- `image`: 画像ファイル (multipart/form-data)
- `pdfAnalysis`: PDF解析結果 (string)

**レスポンス**:
```json
{
  "success": true,
  "answer": "AIによる回答",
  "usage": { ... }
}
```

## ディレクトリ構造

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-pdf/
│   │   │   └── route.ts
│   │   └── answer-question/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   └── file-upload.tsx
└── lib/
    └── utils.ts
```

## ライセンス

MIT License
