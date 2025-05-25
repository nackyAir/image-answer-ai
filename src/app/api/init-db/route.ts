import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const db = new Database('./db.sqlite');

    // 既存テーブルを削除して再作成
    db.exec('DROP TABLE IF EXISTS verification');
    db.exec('DROP TABLE IF EXISTS session');
    db.exec('DROP TABLE IF EXISTS account');
    db.exec('DROP TABLE IF EXISTS user');

    // ユーザーテーブル - OpenAI APIキー管理機能 + トークン使用量累計
    db.exec(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        emailVerified BOOLEAN DEFAULT FALSE,
        image TEXT,
        openaiApiKey TEXT,
        openaiApiKeyEncrypted TEXT,
        hasApiKey BOOLEAN DEFAULT FALSE,
        apiKeySetAt DATETIME,
        totalPromptTokens INTEGER DEFAULT 0,
        totalCompletionTokens INTEGER DEFAULT 0,
        totalTokens INTEGER DEFAULT 0,
        totalCost REAL DEFAULT 0.0,
        dailyTokens INTEGER DEFAULT 0,
        dailyTokensResetAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // セッションテーブル - better-auth最新版対応
    db.exec(`
      CREATE TABLE session (
        id TEXT PRIMARY KEY,
        expiresAt DATETIME NOT NULL,
        token TEXT UNIQUE NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        userId TEXT NOT NULL,
        activeExpires BIGINT,
        idleExpires BIGINT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
      )
    `);

    // アカウントテーブル（ソーシャル認証用） - better-auth最新版対応
    db.exec(`
      CREATE TABLE account (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        userId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        accessTokenExpiresAt DATETIME,
        refreshTokenExpiresAt DATETIME,
        scope TEXT,
        password TEXT,
        salt TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
      )
    `);

    // 認証確認テーブル - better-auth最新版対応
    db.exec(`
      CREATE TABLE verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OpenAI APIキー使用履歴テーブル
    db.exec(`
      CREATE TABLE api_usage_log (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        promptTokens INTEGER DEFAULT 0,
        completionTokens INTEGER DEFAULT 0,
        totalTokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0.0,
        apiEndpoint TEXT,
        requestType TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
      )
    `);

    db.close();

    return NextResponse.json({
      success: true,
      message:
        'データベーステーブルがトークン使用量永続化機能付きで再作成されました',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'データベースの初期化に失敗しました', details: error },
      { status: 500 }
    );
  }
}
