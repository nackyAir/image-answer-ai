'use client';

import { Brain, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChatInput } from '~/components/chat-input';
import { ChatMessage, type Message } from '~/components/chat-message';
import { FileUpload } from '~/components/file-upload';
import { TokenStatus } from '~/components/token-status';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

interface PdfAnalysis {
  originalText: string;
  analysis: string;
  wordCount: number;
}

interface TokenUsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  sessionTokens: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfAnalysis, setPdfAnalysis] = useState<PdfAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    sessionTokens: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初期メッセージを設定
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content:
        'AI画像問題回答システムへようこそ！\n\nまず教材や参考資料のPDFファイルをアップロードしてください。PDFの内容を分析した後、問題の画像を送信していただければ、PDFの内容を参考に回答いたします。',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const createFileUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handlePdfUpload = async (file: File) => {
    setIsProcessing(true);
    setIsUploading(true);
    setUploadProgress(0);

    // PDFアップロードメッセージを追加
    const uploadMessage: Message = {
      id: `pdf-${Date.now()}`,
      type: 'user',
      content: 'PDFファイルをアップロードしました。',
      timestamp: new Date(),
      fileUrl: createFileUrl(file),
      fileName: file.name,
      fileType: 'pdf',
    };
    setMessages((prev) => [...prev, uploadMessage]);

    // 分析中メッセージを追加
    const analysisMessage: Message = {
      id: `analysis-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, analysisMessage]);

    // プログレスバーのアニメーション（段階的に進捗を表示）
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        const stages = [
          { progress: 20, delay: 300, message: 'ファイルを読み込み中...' },
          { progress: 45, delay: 500, message: 'PDFを解析中...' },
          { progress: 70, delay: 800, message: 'テキストを抽出中...' },
          { progress: 90, delay: 600, message: 'AI分析を実行中...' },
          { progress: 100, delay: 400, message: '完了' },
        ];

        let currentStage = 0;

        const advanceProgress = () => {
          if (currentStage < stages.length) {
            const stage = stages[currentStage];
            setUploadProgress(stage.progress);

            // 最後のステージでない場合は次のステージへ
            if (currentStage < stages.length - 1) {
              currentStage++;
              setTimeout(advanceProgress, stage.delay);
            } else {
              setTimeout(resolve, stage.delay);
            }
          }
        };

        advanceProgress();
      });
    };

    try {
      // 進捗アニメーションを開始
      const progressPromise = simulateProgress();

      const formData = new FormData();
      formData.append('pdf', file);

      console.log('PDFアップロード開始:', file.name);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('APIレスポンス受信:', response.status, response.statusText);

      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // HTMLが返された場合のエラーハンドリング
        const text = await response.text();
        console.error('非JSONレスポンス:', text.substring(0, 500));
        throw new Error(
          `サーバーエラーが発生しました (${response.status}). APIエンドポイントが正しく動作していない可能性があります。`
        );
      }

      const data = await response.json();
      console.log('JSONパース完了:', data);

      // 進捗アニメーションの完了を待つ
      await progressPromise;

      if (data.success) {
        // トークン使用量を更新（PDF解析時）
        if (data.usage) {
          updateTokenUsage(data.usage);
        }

        setPdfAnalysis(data);
        setShowPdfUpload(false);

        // 分析完了メッセージに更新
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === analysisMessage.id
              ? {
                  ...msg,
                  content: `PDFの分析が完了しました！\n\n📄 ファイル: ${file.name}\n📊 語数: ${data.wordCount}語\n\n解析された内容を基に、問題の画像を送信してください。画像の問題に対して詳細な回答を提供いたします。`,
                  isLoading: false,
                }
              : msg
          )
        );
      } else {
        const errorMessage = data.error || 'PDF解析に失敗しました';
        const errorCode = data.code || 'UNKNOWN_ERROR';
        const errorDetails = data.details ? `\n詳細: ${data.details}` : '';

        throw new Error(`${errorMessage} (${errorCode})${errorDetails}`);
      }
    } catch (error) {
      console.error('PDF upload error:', error);

      let errorMessage = 'PDFの解析中にエラーが発生しました。';

      if (error instanceof Error) {
        if (error.message.includes('<!DOCTYPE')) {
          errorMessage +=
            '\n\nサーバーエラーが発生しています。以下をご確認ください：\n• OpenAI API Keyが正しく設定されているか\n• 必要な依存関係がインストールされているか\n• 開発サーバーが正常に動作しているか';
        } else {
          errorMessage += `\n\n${error.message}`;
        }
      }

      // エラーメッセージに更新
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === analysisMessage.id
            ? {
                ...msg,
                content: errorMessage,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSendMessage = async (message: string, file?: File) => {
    if (!pdfAnalysis) return;

    setIsProcessing(true);

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message || '問題の画像を送信しました。',
      timestamp: new Date(),
      ...(file && {
        fileUrl: createFileUrl(file),
        fileName: file.name,
        fileType: 'image',
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 処理中メッセージを追加
    const processingMessage: Message = {
      id: `processing-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, processingMessage]);

    try {
      if (file && file.type.startsWith('image/')) {
        // 画像問題の回答を取得
        const formData = new FormData();
        formData.append('image', file);
        formData.append('pdfAnalysis', pdfAnalysis.analysis);

        const response = await fetch('/api/answer-question', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // トークン使用量を更新
          if (data.usage) {
            updateTokenUsage(data.usage);
          }

          // 回答メッセージに更新
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === processingMessage.id
                ? {
                    ...msg,
                    content: data.answer,
                    isLoading: false,
                  }
                : msg
            )
          );
        } else {
          throw new Error(data.error || '問題回答に失敗しました');
        }
      } else {
        // テキストのみの場合は、一般的な応答
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === processingMessage.id
              ? {
                  ...msg,
                  content:
                    'ありがとうございます。問題の画像を添付していただければ、PDFの内容を参考に詳細な回答を提供いたします。',
                  isLoading: false,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Message processing error:', error);

      // エラーメッセージに更新
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === processingMessage.id
            ? {
                ...msg,
                content: `エラーが発生しました。\n\n${error instanceof Error ? error.message : '不明なエラーが発生しました。'}`,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setPdfAnalysis(null);
    setShowPdfUpload(true);
    setIsProcessing(false);
    // トークン使用量もリセット
    setTokenUsage({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      sessionTokens: 0,
    });
  };

  // トークン使用量を更新する関数
  const updateTokenUsage = (usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }) => {
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;

    setTokenUsage((prev) => ({
      promptTokens: prev.promptTokens + promptTokens,
      completionTokens: prev.completionTokens + completionTokens,
      totalTokens: prev.totalTokens + totalTokens,
      sessionTokens: prev.sessionTokens + totalTokens,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="border-white/20 border-b bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-400">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text font-bold text-transparent text-xl">
                  AI 画像問題回答システム
                </h1>
                <p className="flex items-center gap-2 text-gray-600 text-sm">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${pdfAnalysis ? 'bg-green-400' : 'bg-amber-400'}`}
                  ></span>
                  {pdfAnalysis
                    ? `学習完了 • ${pdfAnalysis.wordCount.toLocaleString()}語のデータを分析済み`
                    : 'PDFアップロード待ち'}
                </p>
                <TokenStatus
                  usage={tokenUsage}
                  maxTokensPerDay={100000}
                  className="hidden md:flex"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {pdfAnalysis && (
                <button
                  onClick={resetChat}
                  className="rounded-lg border border-gray-200/50 px-4 py-2 text-gray-600 text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-800"
                >
                  新しいセッション
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-6xl flex-col">
        {/* PDFアップロード画面 */}
        {showPdfUpload && (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <Card className="border-0 bg-white/70 shadow-2xl backdrop-blur-sm">
                <CardHeader className="pb-4 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="mb-2 font-bold text-2xl text-gray-900">
                    教材アップロード
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    PDFファイルをアップロードして、AIが内容を分析します。
                    <br />
                    その後、問題の画像を送信して詳細な回答を取得できます。
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <FileUpload
                    onFileSelect={handlePdfUpload}
                    acceptedFileTypes={['application/pdf']}
                    title="PDFファイルをドロップ"
                    description="または、クリックしてファイルを選択"
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                  <div className="mt-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                        <span className="font-bold text-white text-xs">i</span>
                      </div>
                      <div className="text-blue-800 text-sm">
                        <p className="mb-1 font-medium">サポートしている形式</p>
                        <p>PDF形式のファイル（最大10MB）</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* チャット画面 */}
        {!showPdfUpload && (
          <>
            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 入力エリア */}
            <div className="border-white/20 border-t bg-white/70 backdrop-blur-sm">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isProcessing}
                isPdfUploaded={!!pdfAnalysis}
                placeholder="問題の画像を添付して質問してください..."
                allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
