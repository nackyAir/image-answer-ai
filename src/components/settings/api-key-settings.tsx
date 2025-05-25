'use client';

import { CheckCircle, Eye, EyeOff, Key, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
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

interface ApiKeyInfo {
  hasApiKey: boolean;
  apiKeySetAt: string | null;
  maskedKey: string | null;
}

export function ApiKeySettings() {
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // APIキー情報を取得
  const fetchApiKeyInfo = async () => {
    try {
      const response = await fetch('/api/user/api-key');
      if (response.ok) {
        const data = await response.json();
        setApiKeyInfo(data);
      }
    } catch (error) {
      console.error('APIキー情報の取得に失敗:', error);
    }
  };

  useEffect(() => {
    fetchApiKeyInfo();
  }, []);

  // APIキーを設定
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'APIキーを入力してください' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setApiKey('');
        setShowApiKey(false);
        await fetchApiKeyInfo();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'APIキーの設定に失敗しました',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  // APIキーを削除
  const handleDeleteApiKey = async () => {
    if (
      !confirm(
        'APIキーを削除しますか？削除すると、デフォルトのAPIキーが使用されます。'
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/api-key', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchApiKeyInfo();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'APIキーの削除に失敗しました',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-transparent bg-transparent shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI APIキー設定
        </CardTitle>
        <CardDescription>
          あなた専用のOpenAI
          APIキーを設定することで、個人利用やより高い利用上限を享受できます。
          設定しない場合は、システム共通のAPIキーが使用されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        {/* 現在の状態表示 */}
        {apiKeyInfo && (
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">現在の状態</p>
                <p className="text-muted-foreground text-sm">
                  {apiKeyInfo.hasApiKey ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      個人のAPIキーが設定済み
                    </span>
                  ) : (
                    <span>デフォルトAPIキーを使用中</span>
                  )}
                </p>
                {apiKeyInfo.apiKeySetAt && (
                  <p className="text-muted-foreground text-xs">
                    設定日時:{' '}
                    {new Date(apiKeyInfo.apiKeySetAt).toLocaleString('ja-JP')}
                  </p>
                )}
              </div>
              {apiKeyInfo.hasApiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteApiKey}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
              )}
            </div>
          </div>
        )}

        {/* メッセージ表示 */}
        {message && (
          <Alert
            className={
              message.type === 'error'
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            }
          >
            <AlertDescription
              className={
                message.type === 'error' ? 'text-red-800' : 'text-green-800'
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* APIキー入力フォーム */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI APIキー</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-translate-y-1/2 absolute top-1/2 right-2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              OpenAIアカウントの
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                API Keys
              </a>
              ページで取得できます
            </p>
          </div>

          <Button
            onClick={handleSaveApiKey}
            disabled={loading || !apiKey.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                設定中...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                APIキーを設定
              </>
            )}
          </Button>
        </div>

        {/* 注意事項 */}
        <div className="space-y-2 border-t pt-4 text-muted-foreground text-sm">
          <p className="font-medium">注意事項:</p>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>APIキーは暗号化されて安全に保存されます</li>
            <li>設定後は他の人に共有しないでください</li>
            <li>
              不正使用を防ぐため、定期的にAPIキーを再生成することを推奨します
            </li>
            <li>
              APIキーを削除した場合は、システム共通のAPIキーが使用されます
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
