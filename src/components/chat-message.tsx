'use client'

import { FileText, User, Bot, Clock } from 'lucide-react'
import Image from 'next/image'
import { MarkdownRenderer } from './markdown-renderer'

export interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  fileUrl?: string
  fileName?: string
  fileType?: 'pdf' | 'image'
  isLoading?: boolean
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { type, content, timestamp, fileUrl, fileName, fileType, isLoading } = message

  const isUser = type === 'user'
  const isSystem = type === 'system'

  return (
    <div className={`flex gap-4 p-4 group animate-in fade-in slide-in-from-bottom-4 duration-500 ${
      isUser ? 'flex-row-reverse' : 'flex-row'
    }`}>
      {/* アバター */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105 ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
          : isSystem 
          ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
          : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : isSystem ? (
          <FileText className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* メッセージコンテンツ */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
            : isSystem 
            ? 'bg-white/80 text-gray-800 border border-gray-200/50 rounded-bl-md'
            : 'bg-white/80 border border-gray-200/50 rounded-bl-md'
        }`}>
          {/* ファイル表示 */}
          {fileUrl && fileType === 'pdf' && (
            <div className="mb-3 p-3 bg-white/20 rounded-xl border border-white/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium">{fileName}</span>
                  <p className="text-xs opacity-80">PDFファイル</p>
                </div>
              </div>
            </div>
          )}

          {fileUrl && fileType === 'image' && (
            <div className="mb-3">
              <div className="rounded-xl overflow-hidden border border-white/30 bg-white/10 p-2">
                <Image
                  src={fileUrl}
                  alt="アップロード画像"
                  width={400}
                  height={300}
                  className="rounded-lg object-contain max-w-full h-auto"
                />
              </div>
              {fileName && (
                <p className="text-xs opacity-80 mt-2">{fileName}</p>
              )}
            </div>
          )}

          {/* メッセージテキスト */}
          <div className="leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Clock className="w-5 h-5 animate-spin text-blue-500" />
                  <div className="absolute inset-0 w-5 h-5 animate-ping">
                    <Clock className="w-5 h-5 text-blue-300" />
                  </div>
                </div>
                <span className="text-gray-600">回答を生成中...</span>
              </div>
            ) : type === 'assistant' ? (
              <MarkdownRenderer 
                content={content} 
                variant="default"
              />
            ) : (
              <div className="whitespace-pre-wrap">
                <span className={isUser ? 'text-white' : 'text-gray-800'}>
                  {content}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* タイムスタンプ */}
        <div className={`text-xs text-gray-500 mt-2 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
} 