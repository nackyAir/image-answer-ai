'use client';

import { BarChart3, RefreshCw } from 'lucide-react';
import { TokenStatus } from '~/components/token-status';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useTokenUsage } from '~/hooks/use-token-usage';

export function TokenUsageSettings() {
  const { tokenUsage, refreshUsage } = useTokenUsage();

  const handleRefresh = () => {
    refreshUsage();
  };

  return (
    <Card className="w-full border-transparent bg-transparent shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            トークン使用量
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            更新
          </Button>
        </CardTitle>
        <CardDescription>
          OpenAI APIのトークン使用量と推定コストを確認できます。
          使用量はアカウントに保存され、ログイン時に復元されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <TokenStatus
          usage={tokenUsage}
          showDetailed={true}
          maxTokensPerDay={50000}
        />

        <div className="mt-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
              <span className="font-bold text-white text-xs">i</span>
            </div>
            <div className="text-blue-800 text-sm">
              <p className="mb-1 font-medium">使用量について</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>日次使用量は毎日午前0時にリセットされます</li>
                <li>累計使用量はアカウント作成時からの総使用量です</li>
                <li>
                  セッション使用量は現在のブラウザセッション内の使用量です
                </li>
                <li>コストはGPT-4oの料金体系に基づく推定値です</li>
                <li>
                  個人APIキーを設定している場合は、そのキーでの使用量が記録されます
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
