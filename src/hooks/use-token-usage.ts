import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '~/components/auth/auth-provider';

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

interface ServerTokenUsage {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
  dailyTokens: number;
  dailyTokensResetAt: string;
}

export function useTokenUsage() {
  const { user } = useAuth();
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    sessionTokens: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalAllTimeTokens: 0,
    totalCost: 0,
    dailyTokens: 0,
    dailyTokensResetAt: new Date().toISOString(),
  });

  // サーバーからトークン使用量を取得
  const fetchTokenUsage = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/token-usage');
      if (response.ok) {
        const serverData: ServerTokenUsage = await response.json();

        setTokenUsage((prev) => ({
          ...prev,
          totalPromptTokens: serverData.totalPromptTokens,
          totalCompletionTokens: serverData.totalCompletionTokens,
          totalAllTimeTokens: serverData.totalTokens,
          totalCost: serverData.totalCost,
          dailyTokens: serverData.dailyTokens,
          dailyTokensResetAt: serverData.dailyTokensResetAt,
        }));

        console.log('トークン使用量を取得しました:', serverData);
      }
    } catch (error) {
      console.error('トークン使用量の取得に失敗:', error);
    }
  }, [user]);

  // ユーザーログイン時にトークン使用量を取得
  useEffect(() => {
    if (user) {
      fetchTokenUsage();
    } else {
      // ログアウト時はリセット
      setTokenUsage({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        sessionTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalAllTimeTokens: 0,
        totalCost: 0,
        dailyTokens: 0,
        dailyTokensResetAt: new Date().toISOString(),
      });
    }
  }, [user, fetchTokenUsage]);

  // セッション内のトークン使用量を更新（API応答時に使用）
  const updateSessionUsage = useCallback(
    (usage: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    }) => {
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || promptTokens + completionTokens;

      setTokenUsage((prev) => ({
        ...prev,
        promptTokens: prev.promptTokens + promptTokens,
        completionTokens: prev.completionTokens + completionTokens,
        totalTokens: prev.totalTokens + totalTokens,
        sessionTokens: prev.sessionTokens + totalTokens,
        // サーバー側で更新されるのでここでも楽観的更新
        totalPromptTokens: prev.totalPromptTokens + promptTokens,
        totalCompletionTokens: prev.totalCompletionTokens + completionTokens,
        totalAllTimeTokens: prev.totalAllTimeTokens + totalTokens,
        dailyTokens: prev.dailyTokens + totalTokens,
      }));

      console.log(`セッショントークン使用量更新: +${totalTokens} tokens`);
    },
    []
  );

  // セッションをリセット（新しいPDFアップロード時）
  const resetSession = useCallback(() => {
    setTokenUsage((prev) => ({
      ...prev,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      sessionTokens: 0,
    }));
  }, []);

  // 永続化データを再取得
  const refreshUsage = useCallback(() => {
    fetchTokenUsage();
  }, [fetchTokenUsage]);

  return {
    tokenUsage,
    updateSessionUsage,
    resetSession,
    refreshUsage,
  };
}
