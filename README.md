# AI 画像問題回答システム

PDF資料を解析し、チャット形式で画像の問題に対してAIが回答するWebアプリケーションです。

## 🚀 新機能: 認証システム + APIキー管理 + トークン使用量永続化

better-authを使用した認証システムとユーザー個別のOpenAI APIキー管理機能、そしてトークン使用量の永続化機能が追加されました！

### 認証機能
- 📧 メールアドレス・パスワード認証
- 🔐 Google/GitHub ソーシャルログイン（設定時）
- 🛡️ セッション管理
- 🚪 自動リダイレクト（ログイン状態による）

### APIキー管理機能
- 🔑 個人用OpenAI APIキー設定
- 🔒 暗号化による安全な保存
- 📊 API使用量の個別ログ記録
- 💰 トークン使用量とコスト計算
- 🔄 デフォルトAPIキーへのフォールバック

### トークン使用量永続化機能
- 💾 **アカウント連携による永続化**: ユーザーのトークン使用量がアカウントに保存され、リロードしても復元されます
- 📅 **日次使用量管理**: 毎日自動的にリセットされる日次使用量を追跡
- 📈 **累計使用量表示**: アカウント作成時からの総使用量とコストを確認
- ⚡ **セッション使用量**: 現在のブラウザセッション内での使用量を個別に表示
- 💵 **詳細なコスト計算**: GPT-4o、GPT-4、GPT-3.5-turboの料金体系に基づく正確なコスト算出
- 📊 **設定ページでの詳細表示**: プロンプトトークン、補完トークン、累計コストなどの詳細な統計情報

### 使用方法
1. アプリケーションにアクセスするとログイン画面が表示されます
2. 新規ユーザーは「新規登録」をクリックしてアカウントを作成
3. ログイン後、ヘッダーの「設定」ボタンから個人のAPIキーを設定（オプション）
4. **トークン使用量はアカウントに自動保存**され、ブラウザをリロードしても復元されます
5. PDFアップロード機能と画像問題回答機能を利用可能
6. 設定ページで詳細なトークン使用量とコスト情報を確認可能

## 機能

- **PDFアップロード**: 教材や参考資料のPDFファイルをアップロード
- **PDF内容解析**: OpenAI GPT-4oによるPDFの内容の構造化と要約
- **チャット形式UI**: 自然な会話形式で複数の問題を順次質問
- **画像問題回答**: アップロードした画像の問題をPDFの内容を基に回答
- **メッセージ履歴**: 全ての質問と回答の履歴を保持
- **リアルタイムフィードバック**: 処理状況の表示とエラーハンドリング
- **個人APIキー管理**: ユーザーごとのOpenAI APIキー設定と使用量追跡
- **永続化されたトークン使用量**: アカウント連携によるトークン使用量の永続保存と詳細統計

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **プログラミング言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI API**: OpenAI GPT-4o
- **PDF処理**: pdf-parse
- **ファイルアップロード**: react-dropzone
- **アイコン**: Lucide React
- **認証**: better-auth
- **データベース**: SQLite (better-sqlite3)
- **UI コンポーネント**: shadcn/ui
- **暗号化**: Node.js crypto (AES-256-GCM)

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
pnpm install
# または
bun install
```

3. 環境変数を設定

`.env.local`ファイルを作成してAPI Keyを設定:
```env
# Better Auth
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-character-encryption-key!!

# OpenAI API Key (システム共通・フォールバック用)
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ソーシャルログイン（オプション）
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
```

**重要**: `ENCRYPTION_KEY`は32文字以上の強力なランダム文字列を設定してください。ユーザーのAPIキーを暗号化するために使用されます。

### 開発サーバーの起動

```bash
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスします。

## 使用方法

### 1. アカウント作成・ログイン
- アプリケーション起動時に表示されるログイン画面で認証
- 新規ユーザーは「新規登録」でアカウントを作成

### 2. APIキー設定（オプション）
- ヘッダーの「設定」ボタンをクリック
- 個人のOpenAI APIキーを設定（設定しない場合はシステム共通キーを使用）
- APIキーは暗号化されて安全に保存されます

### 3. PDFアップロード
- メイン画面でPDFファイルを選択
- ドラッグ&ドロップまたはクリックしてファイルを選択
- AIが自動的にPDFの内容を解析・構造化

### 4. チャット開始
- PDFの解析が完了すると、チャット画面に移行
- システムメッセージで解析完了を通知

### 5. 問題画像の送信
- チャット入力欄の📎ボタンをクリックして画像を添付
- または、ドラッグ&ドロップで画像を追加
- テキストメッセージと併せて送信

### 6. AI回答の確認
- PDFの内容を参考にした詳細な回答が表示
- 複数の問題を順次送信可能
- 全ての履歴がチャット形式で保持
- 使用したトークン数とコストが記録されます

### 7. セッションリセット
- ヘッダーの「新しいセッション」ボタンで新しいPDFでの分析を開始

## APIキー管理機能

### 個人APIキー設定
- 設定ページで個人のOpenAI APIキーを設定可能
- APIキーの有効性を自動検証
- 暗号化された状態でデータベースに保存

### 使用量追跡
- トークン使用量（プロンプト・補完・合計）
- 推定コスト計算（GPT-4o、GPT-4、GPT-3.5-turbo対応）
- API呼び出し履歴の記録

### セキュリティ
- AES-256-GCM暗号化によるAPIキー保護
- 各ユーザーの使用量を個別に管理
- 不正使用防止のための検証機能

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
PDFファイルを解析します（認証必須）。

**ヘッダー**:
- 認証情報（Cookie）

**リクエスト**:
- `pdf`: PDFファイル (multipart/form-data)

**レスポンス**:
```json
{
  "success": true,
  "originalText": "PDFの原文",
  "analysis": "AIによる解析結果",
  "wordCount": 1234,
  "usage": { ... },
  "userId": "user-id"
}
```

### POST /api/answer-question
画像の問題に回答します（認証必須）。

**ヘッダー**:
- 認証情報（Cookie）

**リクエスト**:
- `image`: 画像ファイル (multipart/form-data)
- `pdfAnalysis`: PDF解析結果 (string)

**レスポンス**:
```json
{
  "success": true,
  "answer": "AIによる回答",
  "usage": { ... },
  "userId": "user-id"
}
```

### GET /api/user/api-key
ユーザーのAPIキー情報を取得（認証必須）。

**レスポンス**:
```json
{
  "hasApiKey": true,
  "apiKeySetAt": "2024-01-01T00:00:00.000Z",
  "maskedKey": "sk-...設定済み"
}
```

### POST /api/user/api-key
ユーザーのAPIキーを設定（認証必須）。

**リクエスト**:
```json
{
  "apiKey": "sk-..."
}
```

### DELETE /api/user/api-key
ユーザーのAPIキーを削除（認証必須）。

## ディレクトリ構造

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-pdf/
│   │   │   └── route.ts
│   │   ├── answer-question/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts
│   │   ├── init-db/
│   │   │   └── route.ts
│   │   └── user/
│   │       └── api-key/
│   │           └── route.ts
│   ├── login/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx
│   │   ├── login-form.tsx
│   │   └── logout-button.tsx
│   ├── settings/
│   │   └── api-key-settings.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── alert.tsx
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   └── file-upload.tsx
└── lib/
    ├── auth.ts
    ├── auth-client.ts
    ├── crypto.ts
    ├── api-key-manager.ts
    └── utils.ts
```

### 3. データベースの初期化
```bash
# 開発サーバーを起動
pnpm dev

# 別のターミナルでデータベースを初期化
curl -X POST http://localhost:3000/api/init-db
```

**注意**: APIキー管理機能の追加により、データベーススキーマが更新されています。エラーが発生した場合は上記のコマンドでデータベースを再初期化してください。

### 4. Googleソーシャルログインの設定（オプション）

Googleでのソーシャルログインを有効にする場合：

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. OAuth 2.0 認証情報を作成
3. 認証済みリダイレクトURIに `http://localhost:3000/api/auth/callback/google` を追加
4. `.env.local`に以下を追加：

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. APIキー管理機能のテスト
```bash
# 1. ブラウザで http://localhost:3000 にアクセス
# 2. アカウント作成・ログイン
# 3. ヘッダーの「設定」ボタンをクリック
# 4. 個人のOpenAI APIキーを設定（オプション）
#    - APIキーの形式: sk-...
#    - 有効性は自動で検証されます
# 5. メイン画面でPDFアップロードと画像問題回答をテスト
# 6. API使用量がログに記録されることを確認
```

### 6. トラブルシューティング

**データベースエラーが発生した場合:**
```bash
# データベースを再初期化
curl -X POST http://localhost:3000/api/init-db
```

**認証の状態不一致エラーが発生した場合:**
1. ブラウザの開発者ツールを開く
2. Application/Storage タブでCookieとLocal Storageをクリア
3. ページをリロードして再度認証を試行

**APIキー関連のエラーが発生した場合:**
- 個人APIキーが設定されている場合は、設定ページで削除してデフォルトキーを使用
- OpenAI APIキーの有効性と残高を確認
- 暗号化キー（ENCRYPTION_KEY）が正しく設定されているか確認

**Googleログインエラーの場合:**
- Google Cloud Consoleで正しいリダイレクトURIが設定されているか確認
- 環境変数`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が正しく設定されているか確認

## ライセンス

MIT License