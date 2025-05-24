'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
  variant?: 'default' | 'chat'
}

export function MarkdownRenderer({ 
  content, 
  className,
  variant = 'default' 
}: MarkdownRendererProps) {
  const isChat = variant === 'chat'

  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      isChat && "prose-invert",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ヘッダー
          h1: ({ children, ...props }) => (
            <h1 
              className={cn(
                "text-xl font-bold mt-6 mb-4 first:mt-0",
                isChat ? "text-white" : "text-gray-900"
              )} 
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 
              className={cn(
                "text-lg font-semibold mt-5 mb-3 first:mt-0",
                isChat ? "text-white" : "text-gray-900"
              )} 
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 
              className={cn(
                "text-base font-semibold mt-4 mb-2 first:mt-0",
                isChat ? "text-white" : "text-gray-900"
              )} 
              {...props}
            >
              {children}
            </h3>
          ),

          // パラグラフ
          p: ({ children, ...props }) => (
            <p 
              className={cn(
                "mb-3 last:mb-0 leading-relaxed",
                isChat ? "text-white" : "text-gray-800"
              )} 
              {...props}
            >
              {children}
            </p>
          ),

          // リスト
          ul: ({ children, ...props }) => (
            <ul 
              className={cn(
                "list-disc list-inside mb-3 space-y-1",
                isChat ? "text-white" : "text-gray-800"
              )} 
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol 
              className={cn(
                "list-decimal list-inside mb-3 space-y-1",
                isChat ? "text-white" : "text-gray-800"
              )} 
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li 
              className={cn(
                "leading-relaxed",
                isChat ? "text-white" : "text-gray-800"
              )} 
              {...props}
            >
              {children}
            </li>
          ),

          // 強調とイタリック
          strong: ({ children, ...props }) => (
            <strong 
              className={cn(
                "font-bold",
                isChat ? "text-white" : "text-gray-900"
              )} 
              {...props}
            >
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em 
              className={cn(
                "italic",
                isChat ? "text-gray-100" : "text-gray-700"
              )} 
              {...props}
            >
              {children}
            </em>
          ),

          // インラインコード
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            // インラインコードの場合
            if (!match) {
              return (
                <code
                  className={cn(
                    "px-2 py-1 rounded text-sm font-mono",
                    isChat 
                      ? "bg-white/20 text-blue-100 border border-white/30" 
                      : "bg-gray-100 text-blue-600 border border-gray-200"
                  )}
                  {...props}
                >
                  {children}
                </code>
              )
            }

            // コードブロックの場合
            return (
              <div className="mb-4">
                <div className={cn(
                  "flex items-center justify-between px-4 py-2 rounded-t-lg text-sm",
                  isChat ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                )}>
                  <span className="font-mono">{language || 'code'}</span>
                  <span className="text-xs opacity-75">コード</span>
                </div>
                <pre
                  className={cn(
                    "overflow-x-auto rounded-b-lg p-4 text-sm font-mono",
                    isChat ? "bg-gray-900 text-gray-100" : "bg-gray-800 text-gray-100"
                  )}
                >
                  <code>{children}</code>
                </pre>
              </div>
            )
          },

          // 引用
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className={cn(
                "border-l-4 pl-4 my-4 italic",
                isChat 
                  ? "border-blue-300 bg-white/10 py-3 rounded-r text-blue-100" 
                  : "border-blue-400 bg-blue-50 py-3 rounded-r text-blue-800"
              )} 
              {...props}
            >
              {children}
            </blockquote>
          ),

          // リンク
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline transition-colors duration-200",
                isChat 
                  ? "text-blue-200 hover:text-blue-100" 
                  : "text-blue-600 hover:text-blue-800"
              )}
              {...props}
            >
              {children}
            </a>
          ),

          // 水平線
          hr: ({ ...props }) => (
            <hr 
              className={cn(
                "my-6 border-0 h-px",
                isChat ? "bg-white/30" : "bg-gray-300"
              )} 
              {...props}
            />
          ),

          // テーブル
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table 
                className={cn(
                  "min-w-full border-collapse",
                  isChat ? "border-white/30" : "border-gray-300"
                )} 
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th 
              className={cn(
                "border px-3 py-2 text-left font-semibold",
                isChat 
                  ? "border-white/30 bg-white/20 text-white" 
                  : "border-gray-300 bg-gray-100 text-gray-900"
              )} 
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td 
              className={cn(
                "border px-3 py-2",
                isChat 
                  ? "border-white/30 text-white" 
                  : "border-gray-300 text-gray-800"
              )} 
              {...props}
            >
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 