import { auth } from './auth';

export async function migrate() {
  try {
    // better-authのテーブルを作成
    await auth.api.createTables();
    console.log('✅ データベーステーブルが正常に作成されました');
  } catch (error) {
    console.error(
      '❌ データベースマイグレーション中にエラーが発生しました:',
      error
    );
    throw error;
  }
}
