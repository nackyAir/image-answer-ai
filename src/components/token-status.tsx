'use client';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Zap,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';

interface TokenUsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  sessionTokens: number;
  // 永続化されたデータ
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalAllTimeTokens: number;
  totalCost: number;
  dailyTokens: number;
  dailyTokensResetAt: string;
}

interface TokenStatusProps {
  usage?: TokenUsageData;
  maxTokensPerDay?: number;
  className?: string;
  showDetailed?: boolean;
}

const DEFAULT_MAX_TOKENS = 50000; // 1日あたりのデフォルト上限

export function TokenStatus({
  usage,
  maxTokensPerDay = DEFAULT_MAX_TOKENS,
  className,
  showDetailed = false,
}: TokenStatusProps) {
  // 日次使用量を基準にステータスを判定
  const currentDailyUsage = usage?.dailyTokens ?? 0;
  const usagePercentage = Math.min(
    (currentDailyUsage / maxTokensPerDay) * 100,
    100
  );

  // ステータスの判定
  const getStatusInfo = () => {
    if (usagePercentage < 60) {
      return {
        color: 'emerald',
        icon: CheckCircle2,
        label: '良好',
        description: '十分な残量があります',
      };
    } else if (usagePercentage < 85) {
      return {
        color: 'amber',
        icon: AlertTriangle,
        label: '注意',
        description: '残量が少なくなっています',
      };
    } else {
      return {
        color: 'red',
        icon: AlertTriangle,
        label: '警告',
        description: '残量が不足しています',
      };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  // 数値のフォーマット
  const formatTokenCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  // コストのフォーマット
  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  // プログレスバーの色を動的に設定
  const getProgressColor = () => {
    if (usagePercentage < 60) return 'bg-emerald-500';
    if (usagePercentage < 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (showDetailed && usage) {
    // 詳細表示モード（設定ページ用）
    return (
      <div className={cn('space-y-4', className)}>
        {/* 日次使用量 */}
        <div className="rounded-lg border border-gray-200 bg-white/60 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">本日の使用量</h3>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-600 text-sm">
              {formatTokenCount(currentDailyUsage)} /{' '}
              {formatTokenCount(maxTokensPerDay)} トークン
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                status.color === 'emerald' &&
                  'border-emerald-300 bg-emerald-50 text-emerald-700',
                status.color === 'amber' &&
                  'border-amber-300 bg-amber-50 text-amber-700',
                status.color === 'red' &&
                  'border-red-300 bg-red-50 text-red-700'
              )}
            >
              {status.label}
            </Badge>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300 ease-out',
                getProgressColor()
              )}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* 累計使用量 */}
        <div className="rounded-lg border border-gray-200 bg-white/60 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">累計使用量</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">プロンプト</div>
              <div className="font-medium">
                {formatTokenCount(usage.totalPromptTokens)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">補完</div>
              <div className="font-medium">
                {formatTokenCount(usage.totalCompletionTokens)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">合計</div>
              <div className="font-medium">
                {formatTokenCount(usage.totalAllTimeTokens)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">セッション</div>
              <div className="font-medium">
                {formatTokenCount(usage.sessionTokens)}
              </div>
            </div>
          </div>
        </div>

        {/* コスト情報 */}
        <div className="rounded-lg border border-gray-200 bg-white/60 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-gray-900">コスト</h3>
          </div>

          <div className="text-center">
            <div className="font-bold text-2xl text-gray-900">
              {formatCost(usage.totalCost)}
            </div>
            <div className="text-gray-600 text-sm">累計コスト</div>
          </div>
        </div>
      </div>
    );
  }

  // コンパクト表示モード（ヘッダー用）
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200/50 bg-white/60 p-3 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      {/* ステータスアイコンとラベル */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            status.color === 'emerald' && 'bg-emerald-100',
            status.color === 'amber' && 'bg-amber-100',
            status.color === 'red' && 'bg-red-100'
          )}
        >
          <StatusIcon
            className={cn(
              'h-4 w-4',
              status.color === 'emerald' && 'text-emerald-600',
              status.color === 'amber' && 'text-amber-600',
              status.color === 'red' && 'text-red-600'
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-700 text-sm">
            トークン残量
          </span>
        </div>
      </div>

      {/* プログレスバーエリア */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              status.color === 'emerald' &&
                'border-emerald-300 bg-emerald-50 text-emerald-700',
              status.color === 'amber' &&
                'border-amber-300 bg-amber-50 text-amber-700',
              status.color === 'red' && 'border-red-300 bg-red-50 text-red-700'
            )}
          >
            {status.label}
          </Badge>
          <span className="truncate text-gray-600 text-xs">
            {formatTokenCount(currentDailyUsage)} /{' '}
            {formatTokenCount(maxTokensPerDay)}
          </span>
        </div>

        {/* カスタムプログレスバー */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              getProgressColor()
            )}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* 詳細情報（ホバー時に表示） */}
      {usage && (
        <div className="hidden lg:block">
          <div className="text-right text-gray-500 text-xs">
            <div>セッション: {formatTokenCount(usage.sessionTokens)}</div>
            <div>累計: {formatTokenCount(usage.totalAllTimeTokens)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
