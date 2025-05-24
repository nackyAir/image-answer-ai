'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage, type Message } from '~/components/chat-message'
import { ChatInput } from '~/components/chat-input'
import { FileUpload } from '~/components/file-upload'
import { Progress } from '~/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Brain, FileText, MessageSquare } from 'lucide-react'

interface PdfAnalysis {
  originalText: string
  analysis: string
  wordCount: number
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [pdfAnalysis, setPdfAnalysis] = useState<PdfAnalysis | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPdfUpload, setShowPdfUpload] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初期メッセージを設定
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content: 'AI画像問題回答システムへようこそ！\n\nまず教材や参考資料のPDFファイルをアップロードしてください。PDFの内容を分析した後、問題の画像を送信していただければ、PDFの内容を参考に回答いたします。',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const createFileUrl = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const handlePdfUpload = async (file: File) => {
    setIsProcessing(true)
    setIsUploading(true)
    setUploadProgress(0)
    
    // PDFアップロードメッセージを追加
    const uploadMessage: Message = {
      id: `pdf-${Date.now()}`,
      type: 'user',
      content: 'PDFファイルをアップロードしました。',
      timestamp: new Date(),
      fileUrl: createFileUrl(file),
      fileName: file.name,
      fileType: 'pdf'
    }
    setMessages(prev => [...prev, uploadMessage])

    // 分析中メッセージを追加
    const analysisMessage: Message = {
      id: `analysis-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, analysisMessage])

    // プログレスバーのアニメーション（段階的に進捗を表示）
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        const stages = [
          { progress: 20, delay: 300, message: 'ファイルを読み込み中...' },
          { progress: 45, delay: 500, message: 'PDFを解析中...' },
          { progress: 70, delay: 800, message: 'テキストを抽出中...' },
          { progress: 90, delay: 600, message: 'AI分析を実行中...' },
          { progress: 100, delay: 400, message: '完了' }
        ]

        let currentStage = 0
        
        const advanceProgress = () => {
          if (currentStage < stages.length) {
            const stage = stages[currentStage]
            setUploadProgress(stage.progress)
            
            // 最後のステージでない場合は次のステージへ
            if (currentStage < stages.length - 1) {
              currentStage++
              setTimeout(advanceProgress, stage.delay)
            } else {
              setTimeout(resolve, stage.delay)
            }
          }
        }
        
        advanceProgress()
      })
    }

    try {
      // 進捗アニメーションを開始
      const progressPromise = simulateProgress()
      
      const formData = new FormData()
      formData.append('pdf', file)
      
      console.log('PDFアップロード開始:', file.name)
      
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      })
      
      console.log('APIレスポンス受信:', response.status, response.statusText)
      
      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)
      
      if (!contentType || !contentType.includes('application/json')) {
        // HTMLが返された場合のエラーハンドリング
        const text = await response.text()
        console.error('非JSONレスポンス:', text.substring(0, 500))
        throw new Error(`サーバーエラーが発生しました (${response.status}). APIエンドポイントが正しく動作していない可能性があります。`)
      }
      
      const data = await response.json()
      console.log('JSONパース完了:', data)
      
      // 進捗アニメーションの完了を待つ
      await progressPromise
      
      if (data.success) {
        setPdfAnalysis(data)
        setShowPdfUpload(false)
        
        // 分析完了メッセージに更新
        setMessages(prev => prev.map(msg => 
          msg.id === analysisMessage.id 
            ? {
                ...msg,
                content: `PDFの分析が完了しました！\n\n📄 ファイル: ${file.name}\n📊 語数: ${data.wordCount}語\n\n解析された内容を基に、問題の画像を送信してください。画像の問題に対して詳細な回答を提供いたします。`,
                isLoading: false
              }
            : msg
        ))
      } else {
        const errorMessage = data.error || 'PDF解析に失敗しました'
        const errorCode = data.code || 'UNKNOWN_ERROR'
        const errorDetails = data.details ? `\n詳細: ${data.details}` : ''
        
        throw new Error(`${errorMessage} (${errorCode})${errorDetails}`)
      }
    } catch (error) {
      console.error('PDF upload error:', error)
      
      let errorMessage = 'PDFの解析中にエラーが発生しました。'
      
      if (error instanceof Error) {
        if (error.message.includes('<!DOCTYPE')) {
          errorMessage += '\n\nサーバーエラーが発生しています。以下をご確認ください：\n• OpenAI API Keyが正しく設定されているか\n• 必要な依存関係がインストールされているか\n• 開発サーバーが正常に動作しているか'
        } else {
          errorMessage += `\n\n${error.message}`
        }
      }
      
      // エラーメッセージに更新
      setMessages(prev => prev.map(msg => 
        msg.id === analysisMessage.id 
          ? {
              ...msg,
              content: errorMessage,
              isLoading: false
            }
          : msg
      ))
    } finally {
      setIsProcessing(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSendMessage = async (message: string, file?: File) => {
    if (!pdfAnalysis) return

    setIsProcessing(true)
    
    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message || '問題の画像を送信しました。',
      timestamp: new Date(),
      ...(file && {
        fileUrl: createFileUrl(file),
        fileName: file.name,
        fileType: 'image'
      })
    }
    setMessages(prev => [...prev, userMessage])

    // 処理中メッセージを追加
    const processingMessage: Message = {
      id: `processing-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, processingMessage])

    try {
      if (file && file.type.startsWith('image/')) {
        // 画像問題の回答を取得
        const formData = new FormData()
        formData.append('image', file)
        formData.append('pdfAnalysis', pdfAnalysis.analysis)
        
        const response = await fetch('/api/answer-question', {
          method: 'POST',
          body: formData,
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 回答メッセージに更新
          setMessages(prev => prev.map(msg => 
            msg.id === processingMessage.id 
              ? {
                  ...msg,
                  content: data.answer,
                  isLoading: false
                }
              : msg
          ))
        } else {
          throw new Error(data.error || '問題回答に失敗しました')
        }
      } else {
        // テキストのみの場合は、一般的な応答
        setMessages(prev => prev.map(msg => 
          msg.id === processingMessage.id 
            ? {
                ...msg,
                content: 'ありがとうございます。問題の画像を添付していただければ、PDFの内容を参考に詳細な回答を提供いたします。',
                isLoading: false
              }
            : msg
        ))
      }
    } catch (error) {
      console.error('Message processing error:', error)
      
      // エラーメッセージに更新
      setMessages(prev => prev.map(msg => 
        msg.id === processingMessage.id 
          ? {
              ...msg,
              content: `エラーが発生しました。\n\n${error instanceof Error ? error.message : '不明なエラーが発生しました。'}`,
              isLoading: false
            }
          : msg
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  const resetChat = () => {
    setMessages([])
    setPdfAnalysis(null)
    setShowPdfUpload(true)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI 画像問題回答システム
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${pdfAnalysis ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                  {pdfAnalysis 
                    ? `学習完了 • ${pdfAnalysis.wordCount.toLocaleString()}語のデータを分析済み`
                    : 'PDFアップロード待ち'
                  }
                </p>
              </div>
            </div>
            
            {pdfAnalysis && (
              <button
                onClick={resetChat}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 border border-gray-200/50"
              >
                新しいセッション
              </button>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-col max-w-6xl mx-auto w-full h-[calc(100vh-80px)]">
        {/* PDFアップロード画面 */}
        {showPdfUpload && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    教材アップロード
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    PDFファイルをアップロードして、AIが内容を分析します。<br />
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
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">サポートしている形式</p>
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
              <div className="py-6 px-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 入力エリア */}
            <div className="bg-white/70 backdrop-blur-sm border-t border-white/20">
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
  )
}
