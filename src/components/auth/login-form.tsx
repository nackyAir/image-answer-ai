'use client';

import { Brain, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { SocialButton } from '~/components/auth/social-button';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { signIn, signUp } from '~/lib/auth-client';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // ソーシャルプロバイダーの利用可能性をチェック
  // 実際の本番環境では環境変数が設定されている場合のみ表示
  // 開発環境ではデモとして常に表示
  const isGoogleEnabled =
    process.env.NODE_ENV === 'development' ||
    !!(
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );
  const isGithubEnabled =
    process.env.NODE_ENV === 'development' ||
    !!(
      process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    );
  const hasSocialProviders = isGoogleEnabled || isGithubEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        console.log('サインアップ開始:', { email, name });
        const result = await signUp.email({
          email,
          password,
          name,
        });
        console.log('サインアップ結果:', result);

        if (result.error) {
          throw new Error(
            result.error.message || 'アカウント作成に失敗しました'
          );
        }
      } else {
        console.log('サインイン開始:', { email });
        const result = await signIn.email({
          email,
          password,
        });
        console.log('サインイン結果:', result);

        if (result.error) {
          throw new Error(result.error.message || 'ログインに失敗しました');
        }
      }
    } catch (error) {
      console.error('認証エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          isSignUp ? 'アカウント作成に失敗しました' : 'ログインに失敗しました'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Google認証開始');
      const result = await signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
      console.log('Google認証結果:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Google認証に失敗しました');
      }
    } catch (error) {
      console.error('Google認証エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Google認証に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('GitHub認証開始');
      const result = await signIn.social({
        provider: 'github',
        callbackURL: '/',
      });
      console.log('GitHub認証結果:', result);

      if (result.error) {
        throw new Error(result.error.message || 'GitHub認証に失敗しました');
      }
    } catch (error) {
      console.error('GitHub認証エラー:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('GitHub認証に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="font-bold text-2xl text-gray-900">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              {isSignUp
                ? 'AI画像問題回答システムへようこそ'
                : 'アカウントにサインインしてください'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* ソーシャルログイン - 利用可能な場合のみ表示 */}
          {hasSocialProviders && (
            <>
              <div className="space-y-3">
                {isGoogleEnabled && (
                  <SocialButton
                    provider="google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  />
                )}
                {isGithubEnabled && (
                  <SocialButton
                    provider="github"
                    onClick={handleGithubSignIn}
                    disabled={isLoading}
                  />
                )}
              </div>

              {/* 区切り線 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-gray-200 border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">または</span>
                </div>
              </div>
            </>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="田中太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading
                ? '処理中...'
                : isSignUp
                  ? 'アカウント作成'
                  : 'ログイン'}
            </Button>
          </form>

          {/* フォーム切り替え */}
          <div className="text-center text-sm">
            <span className="text-gray-600">
              {isSignUp
                ? 'すでにアカウントをお持ちですか？'
                : 'アカウントをお持ちでない方は'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="ml-1 font-medium text-blue-600 hover:text-blue-700"
              disabled={isLoading}
            >
              {isSignUp ? 'ログイン' : '新規登録'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
