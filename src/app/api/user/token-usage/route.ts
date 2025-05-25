import { type NextRequest, NextResponse } from 'next/server';
import { apiKeyManager } from '~/lib/api-key-manager';
import { auth } from '~/lib/auth';

// ユーザーのトークン使用量を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const tokenUsage = await apiKeyManager.getUserTokenUsage(session.user.id);

    if (!tokenUsage) {
      // ユーザーが見つからない場合はデフォルト値を返す
      return NextResponse.json({
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        dailyTokens: 0,
        dailyTokensResetAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(tokenUsage);
  } catch (error) {
    console.error('トークン使用量取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
