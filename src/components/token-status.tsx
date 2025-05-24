'use client';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';

interface TokenUsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  sessionTokens: number;
}

interface TokenStatusProps {
  usage?: TokenUsageData;
  maxTokensPerDay?: number;
  className?: string;
}

const DEFAULT_MAX_TOKENS = 100000; // 1日あたりのデフォルト上限

export function TokenStatus({
  usage,
  maxTokensPerDay = DEFAULT_MAX_TOKENS,
  className,
}: TokenStatusProps) {
  // 使用状況の計算
  const currentUsage = usage?.sessionTokens ?? 0;
  const usagePercentage = Math.min((currentUsage / maxTokensPerDay) * 100, 100);

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
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  // プログレスバーの色を動的に設定
  const getProgressColor = () => {
    if (usagePercentage < 60) return 'bg-emerald-500';
    if (usagePercentage < 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

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
            {formatTokenCount(currentUsage)} /{' '}
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
            <div>入力: {formatTokenCount(usage.promptTokens)}</div>
            <div>出力: {formatTokenCount(usage.completionTokens)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
