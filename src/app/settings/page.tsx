'use client';

import { Brain, Settings } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '~/components/auth/logout-button';
import { ApiKeySettings } from '~/components/settings/api-key-settings';
import { TokenUsageSettings } from '~/components/settings/token-usage-settings';
import { Button } from '~/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="border-white/20 border-b bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-400">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text font-bold text-transparent text-xl">
                    AI 画像問題回答システム
                  </h1>
                  <p className="flex items-center gap-2 text-gray-600 text-sm">
                    <Settings className="h-3 w-3" />
                    設定ページ
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ホームに戻る
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text font-bold text-3xl text-transparent">
              設定
            </h2>
            <p className="mt-2 text-gray-600">
              アカウントとアプリケーションの設定を管理します
            </p>
          </div>

          <div className="space-y-8">
            <section className="rounded-xl border border-white/40 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
              <h3 className="mb-6 flex items-center gap-2 font-semibold text-gray-800 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                API設定
              </h3>
              <ApiKeySettings />
            </section>

            <section className="rounded-xl border border-white/40 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
              <h3 className="mb-6 flex items-center gap-2 font-semibold text-gray-800 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-md">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                使用量
              </h3>
              <TokenUsageSettings />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
