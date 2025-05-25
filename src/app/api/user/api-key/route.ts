import Database from 'better-sqlite3';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { encryptApiKey, maskApiKey } from '~/lib/crypto';

type UserApiKeyInfo = {
  hasApiKey: boolean;
  apiKeySetAt: string | null;
};

// APIキーを取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const db = new Database('./db.sqlite');
    const user = db
      .prepare('SELECT hasApiKey, apiKeySetAt FROM user WHERE id = ?')
      .get(session.user.id) as UserApiKeyInfo | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    db.close();

    return NextResponse.json({
      hasApiKey: user.hasApiKey,
      apiKeySetAt: user.apiKeySetAt,
      maskedKey: user.hasApiKey ? 'sk-...設定済み' : null,
    });
  } catch (error) {
    console.error('APIキー取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// APIキーを設定
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'APIキーが必要です' }, { status: 400 });
    }

    // OpenAI APIキーの形式チェック
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return NextResponse.json(
        { error: '無効なOpenAI APIキー形式です' },
        { status: 400 }
      );
    }

    // APIキーをテスト
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: '無効なAPIキーです' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'APIキーの検証に失敗しました' },
        { status: 400 }
      );
    }

    // APIキーを暗号化
    const encryptedApiKey = encryptApiKey(apiKey);

    const db = new Database('./db.sqlite');

    // ユーザーのAPIキーを更新
    const stmt = db.prepare(`
      UPDATE user 
      SET openaiApiKeyEncrypted = ?, hasApiKey = TRUE, apiKeySetAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(encryptedApiKey, session.user.id);
    db.close();

    return NextResponse.json({
      success: true,
      message: 'APIキーが正常に設定されました',
      maskedKey: maskApiKey(apiKey),
    });
  } catch (error) {
    console.error('APIキー設定エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// APIキーを削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const db = new Database('./db.sqlite');

    // ユーザーのAPIキーを削除
    const stmt = db.prepare(`
      UPDATE user 
      SET openaiApiKeyEncrypted = NULL, hasApiKey = FALSE, apiKeySetAt = NULL, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(session.user.id);
    db.close();

    return NextResponse.json({
      success: true,
      message: 'APIキーが削除されました',
    });
  } catch (error) {
    console.error('APIキー削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
