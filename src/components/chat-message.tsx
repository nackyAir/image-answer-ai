'use client';

import { Bot, FileText, User } from 'lucide-react';
import Image from 'next/image';
import { MarkdownRenderer } from './markdown-renderer';
import { Loading } from './ui/loading';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'image';
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { type, content, timestamp, fileUrl, fileName, fileType, isLoading } =
    message;

  const isUser = type === 'user';
  const isSystem = type === 'system';

  return (
    <div
      className={`group fade-in slide-in-from-bottom-4 flex animate-in gap-4 p-4 duration-500 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* アバター */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 transform items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-105 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
            : isSystem
              ? 'bg-gradient-to-r from-gray-500 to-gray-600'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : isSystem ? (
          <FileText className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* メッセージコンテンツ */}
      <div
        className={`max-w-3xl flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`rounded-2xl p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
            isUser
              ? 'rounded-br-md bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : isSystem
                ? 'rounded-bl-md border border-gray-200/50 bg-white/80 text-gray-800'
                : 'rounded-bl-md border border-gray-200/50 bg-white/80'
          }`}
        >
          {/* ファイル表示 */}
          {fileUrl && fileType === 'pdf' && (
            <div className="mb-3 rounded-xl border border-white/30 bg-white/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-medium text-sm">{fileName}</span>
                  <p className="text-xs opacity-80">PDFファイル</p>
                </div>
              </div>
            </div>
          )}

          {fileUrl && fileType === 'image' && (
            <div className="mb-3">
              <div className="overflow-hidden rounded-xl border border-white/30 bg-white/10 p-2">
                <Image
                  src={fileUrl}
                  alt="アップロード画像"
                  width={400}
                  height={300}
                  className="h-auto max-w-full rounded-lg object-contain"
                />
              </div>
              {fileName && (
                <p className="mt-2 text-xs opacity-80">{fileName}</p>
              )}
            </div>
          )}

          {/* メッセージテキスト */}
          <div className="leading-relaxed">
            {isLoading ? (
              <Loading
                icon="zap"
                text="回答を生成中..."
                variant="default"
                animation="ping"
                className="text-gray-600"
              />
            ) : type === 'assistant' ? (
              <MarkdownRenderer content={content} variant="default" />
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
        <div
          className={`mt-2 px-2 text-gray-500 text-xs ${isUser ? 'text-right' : 'text-left'}`}
        >
          {timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
