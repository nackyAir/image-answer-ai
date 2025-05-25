'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Loading,
  LoadingDots,
  LoadingPulse,
  LoadingSpinner,
} from './ui/loading';

export function LoadingDemo() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>基本的なローディング</CardTitle>
          <CardDescription>
            アイコンとテキストを組み合わせたローディング表示
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">デフォルト（Loader2アイコン）</p>
            <Loading text="読み込み中..." />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">時計アイコン</p>
            <Loading icon="clock" text="処理中..." variant="secondary" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">雷アイコン</p>
            <Loading icon="zap" text="生成中..." variant="success" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アニメーションバリエーション</CardTitle>
          <CardDescription>異なるアニメーション効果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">スピン（デフォルト）</p>
            <Loading animation="spin" text="回転中..." />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">パルス</p>
            <Loading animation="pulse" text="点滅中..." variant="warning" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">ピング</p>
            <Loading animation="ping" text="送信中..." variant="destructive" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>サイズバリエーション</CardTitle>
          <CardDescription>異なるサイズでの表示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">小</p>
            <Loading size="sm" text="小さなローディング" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">標準</p>
            <Loading size="default" text="標準サイズ" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">大</p>
            <Loading size="lg" text="大きなローディング" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>専用コンポーネント</CardTitle>
          <CardDescription>特殊なローディングアニメーション</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">スピナー</p>
            <div className="flex items-center gap-4">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="default" />
              <LoadingSpinner size="lg" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">ドット</p>
            <div className="flex items-center gap-4">
              <LoadingDots size="sm" />
              <LoadingDots size="default" />
              <LoadingDots size="lg" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">パルス</p>
            <div className="flex items-center gap-4">
              <LoadingPulse size="sm" />
              <LoadingPulse size="default" />
              <LoadingPulse size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>実用例</CardTitle>
          <CardDescription>実際の使用場面での表示例</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="font-medium text-sm">チャットメッセージでの使用</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Loading
                icon="zap"
                text="回答を生成中..."
                variant="default"
                animation="ping"
                className="text-gray-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">ボタン内での使用</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white"
                disabled
              >
                <LoadingSpinner
                  size="sm"
                  className="border-white border-t-transparent"
                />
                送信中...
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white"
                disabled
              >
                <Loading
                  size="sm"
                  showText={false}
                  animation="spin"
                  className="text-white"
                />
                保存中
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
