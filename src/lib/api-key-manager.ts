import Database from 'better-sqlite3';
import { decryptApiKey } from './crypto';

export interface ApiKeyManager {
  getApiKey(userId?: string): Promise<string>;
  isUserApiKey(userId: string): Promise<boolean>;
  logUsage(
    userId: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cost: number;
      apiEndpoint: string;
      requestType: string;
    }
  ): Promise<void>;
  getUserTokenUsage(userId: string): Promise<{
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalCost: number;
    dailyTokens: number;
    dailyTokensResetAt: string;
  } | null>;
  resetDailyTokensIfNeeded(userId: string): Promise<void>;
}

class ApiKeyManagerImpl implements ApiKeyManager {
  private defaultApiKey: string;

  constructor() {
    this.defaultApiKey = process.env.OPENAI_API_KEY || '';

    if (!this.defaultApiKey) {
      console.warn('OPENAI_API_KEY環境変数が設定されていません');
    }
  }

  async getApiKey(userId?: string): Promise<string> {
    // ユーザーIDが指定されていない場合はデフォルトキーを返す
    if (!userId) {
      return this.defaultApiKey;
    }

    try {
      const db = new Database('./db.sqlite');
      const user = db
        .prepare(
          'SELECT openaiApiKeyEncrypted, hasApiKey FROM user WHERE id = ?'
        )
        .get(userId) as
        | {
            openaiApiKeyEncrypted: string | null;
            hasApiKey: boolean;
          }
        | undefined;

      db.close();

      // ユーザーが見つからない、またはAPIキーが設定されていない場合
      if (!user || !user.hasApiKey || !user.openaiApiKeyEncrypted) {
        console.log(
          `ユーザー ${userId} のAPIキーが見つからないため、デフォルトキーを使用します`
        );
        return this.defaultApiKey;
      }

      // 暗号化されたAPIキーを復号化
      const decryptedApiKey = decryptApiKey(user.openaiApiKeyEncrypted);

      if (!decryptedApiKey) {
        console.error(
          `ユーザー ${userId} のAPIキーの復号化に失敗しました。デフォルトキーを使用します`
        );
        return this.defaultApiKey;
      }

      console.log(`ユーザー ${userId} の個人APIキーを使用します`);
      return decryptedApiKey;
    } catch (error) {
      console.error('APIキーの取得中にエラーが発生しました:', error);
      return this.defaultApiKey;
    }
  }

  async getUserTokenUsage(userId: string): Promise<{
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalCost: number;
    dailyTokens: number;
    dailyTokensResetAt: string;
  } | null> {
    try {
      const db = new Database('./db.sqlite');

      // 日次トークンのリセットが必要かチェック
      await this.resetDailyTokensIfNeeded(userId);

      const user = db
        .prepare(`
        SELECT 
          totalPromptTokens, 
          totalCompletionTokens, 
          totalTokens, 
          totalCost, 
          dailyTokens, 
          dailyTokensResetAt 
        FROM user 
        WHERE id = ?
      `)
        .get(userId) as
        | {
            totalPromptTokens: number;
            totalCompletionTokens: number;
            totalTokens: number;
            totalCost: number;
            dailyTokens: number;
            dailyTokensResetAt: string;
          }
        | undefined;

      db.close();

      return user || null;
    } catch (error) {
      console.error('トークン使用量の取得中にエラーが発生しました:', error);
      return null;
    }
  }

  async resetDailyTokensIfNeeded(userId: string): Promise<void> {
    try {
      const db = new Database('./db.sqlite');

      const user = db
        .prepare('SELECT dailyTokensResetAt FROM user WHERE id = ?')
        .get(userId) as
        | {
            dailyTokensResetAt: string;
          }
        | undefined;

      if (!user) {
        db.close();
        return;
      }

      const resetDate = new Date(user.dailyTokensResetAt);
      const now = new Date();

      // 日付が変わった場合は日次トークンをリセット
      if (resetDate.toDateString() !== now.toDateString()) {
        db.prepare(`
          UPDATE user 
          SET dailyTokens = 0, dailyTokensResetAt = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(userId);

        console.log(
          `ユーザー ${userId} の日次トークン使用量をリセットしました`
        );
      }

      db.close();
    } catch (error) {
      console.error('日次トークンリセット中にエラーが発生しました:', error);
    }
  }

  async logUsage(
    userId: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cost: number;
      apiEndpoint: string;
      requestType: string;
    }
  ): Promise<void> {
    try {
      const db = new Database('./db.sqlite');

      // トランザクション開始
      db.exec('BEGIN TRANSACTION');

      try {
        // 使用ログを記録
        const logStmt = db.prepare(`
          INSERT INTO api_usage_log (
            id, userId, promptTokens, completionTokens, totalTokens, cost, apiEndpoint, requestType, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        logStmt.run(
          crypto.randomUUID(),
          userId,
          usage.promptTokens,
          usage.completionTokens,
          usage.totalTokens,
          usage.cost,
          usage.apiEndpoint,
          usage.requestType
        );

        // ユーザーの累計使用量を更新
        const updateStmt = db.prepare(`
          UPDATE user 
          SET 
            totalPromptTokens = totalPromptTokens + ?,
            totalCompletionTokens = totalCompletionTokens + ?,
            totalTokens = totalTokens + ?,
            totalCost = totalCost + ?,
            dailyTokens = dailyTokens + ?,
            updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        updateStmt.run(
          usage.promptTokens,
          usage.completionTokens,
          usage.totalTokens,
          usage.cost,
          usage.totalTokens,
          userId
        );

        // トランザクションをコミット
        db.exec('COMMIT');

        console.log(
          `ユーザー ${userId} のトークン使用量を記録・更新しました: ${usage.totalTokens} tokens, $${usage.cost.toFixed(4)}`
        );
      } catch (error) {
        // エラー時はロールバック
        db.exec('ROLLBACK');
        throw error;
      }

      db.close();
    } catch (error) {
      console.error('API使用ログの記録に失敗しました:', error);
    }
  }

  async isUserApiKey(userId: string): Promise<boolean> {
    try {
      const db = new Database('./db.sqlite');
      const user = db
        .prepare(
          'SELECT hasApiKey, openaiApiKeyEncrypted FROM user WHERE id = ?'
        )
        .get(userId) as
        | {
            hasApiKey: boolean;
            openaiApiKeyEncrypted: string | null;
          }
        | undefined;

      db.close();

      // ユーザーが見つからない、またはAPIキーが設定されていない場合はfalse
      if (!user || !user.hasApiKey || !user.openaiApiKeyEncrypted) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('ユーザーAPIキー判別中にエラーが発生しました:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const apiKeyManager = new ApiKeyManagerImpl();
