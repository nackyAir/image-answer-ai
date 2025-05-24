'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
  variant?: 'default' | 'chat'
}

type MarkdownVariant = NonNullable<MarkdownRendererProps['variant']>

// テーマカラーの定義
const THEME_COLORS = {
  default: {
    primary: 'text-gray-900',
    secondary: 'text-gray-800',
    muted: 'text-gray-700',
    accent: 'text-blue-600',
    border: 'border-gray-300',
    background: {
      subtle: 'bg-gray-50',
      card: 'bg-gray-100',
      code: 'bg-gray-800',
      quote: 'bg-blue-50',
    }
  },
  chat: {
    primary: 'text-white',
    secondary: 'text-white',
    muted: 'text-gray-100',
    accent: 'text-blue-200',
    border: 'border-white/30',
    background: {
      subtle: 'bg-white/10',
      card: 'bg-white/20',
      code: 'bg-gray-900',
      quote: 'bg-white/10',
    }
  }
} as const

// スタイリングヘルパー関数
const createThemeClasses = (variant: MarkdownVariant) => {
  const theme = THEME_COLORS[variant]
  
  return {
    heading: (level: 1 | 2 | 3) => {
      const sizes = {
        1: 'text-xl font-bold mt-6 mb-4',
        2: 'text-lg font-semibold mt-5 mb-3', 
        3: 'text-base font-semibold mt-4 mb-2'
      }
      return cn(sizes[level], 'first:mt-0', theme.primary)
    },
    text: cn('mb-3 last:mb-0 leading-relaxed', theme.secondary),
    list: cn('list-inside mb-3 space-y-1', theme.secondary),
    listItem: cn('leading-relaxed', theme.secondary),
    strong: cn('font-bold', theme.primary),
    emphasis: cn('italic', theme.muted),
    code: {
      inline: cn(
        'px-2 py-1 rounded text-sm font-mono',
        variant === 'chat' 
          ? 'bg-white/20 text-blue-100 border border-white/30'
          : 'bg-gray-100 text-blue-600 border border-gray-200'
      ),
      block: cn(
        'overflow-x-auto rounded-b-lg p-4 text-sm font-mono',
        variant === 'chat' ? 'bg-gray-900 text-gray-100' : theme.background.code + ' text-gray-100'
      ),
      header: cn(
        'flex items-center justify-between px-4 py-2 rounded-t-lg text-sm',
        variant === 'chat' ? 'bg-gray-800 text-gray-300' : theme.background.card + ' text-gray-600'
      )
    },
    quote: cn(
      'border-l-4 pl-4 my-4 italic py-3 rounded-r',
      variant === 'chat'
        ? 'border-blue-300 bg-white/10 text-blue-100'
        : 'border-blue-400 bg-blue-50 text-blue-800'
    ),
    link: cn(
      'underline transition-colors duration-200',
      variant === 'chat' 
        ? 'text-blue-200 hover:text-blue-100'
        : 'text-blue-600 hover:text-blue-800'
    ),
    divider: cn(
      'my-6 border-0 h-px',
      variant === 'chat' ? 'bg-white/30' : 'bg-gray-300'
    ),
    table: {
      container: 'overflow-x-auto mb-4',
      table: cn('min-w-full border-collapse', theme.border),
      th: cn(
        'border px-3 py-2 text-left font-semibold',
        theme.border,
        variant === 'chat'
          ? 'bg-white/20 text-white'
          : theme.background.card + ' text-gray-900'
      ),
      td: cn('border px-3 py-2', theme.border, theme.secondary)
    }
  }
}

// 言語判定ヘルパー関数（letを使用しない）
const extractLanguageFromClassName = (className: string | undefined): string => {
  const match = className?.match(/language-(\w+)/)
  return match?.[1] ?? ''
}

// カスタムコンポーネント群
const createMarkdownComponents = (variant: MarkdownVariant): Components => {
  const classes = createThemeClasses(variant)

  return {
    h1: ({ children, ...props }) => (
      <h1 className={classes.heading(1)} {...props}>
        {children}
      </h1>
    ),
    
    h2: ({ children, ...props }) => (
      <h2 className={classes.heading(2)} {...props}>
        {children}
      </h2>
    ),
    
    h3: ({ children, ...props }) => (
      <h3 className={classes.heading(3)} {...props}>
        {children}
      </h3>
    ),

    p: ({ children, ...props }) => (
      <p className={classes.text} {...props}>
        {children}
      </p>
    ),

    ul: ({ children, ...props }) => (
      <ul className={cn(classes.list, 'list-disc')} {...props}>
        {children}
      </ul>
    ),
    
    ol: ({ children, ...props }) => (
      <ol className={cn(classes.list, 'list-decimal')} {...props}>
        {children}
      </ol>
    ),
    
    li: ({ children, ...props }) => (
      <li className={classes.listItem} {...props}>
        {children}
      </li>
    ),

    strong: ({ children, ...props }) => (
      <strong className={classes.strong} {...props}>
        {children}
      </strong>
    ),
    
    em: ({ children, ...props }) => (
      <em className={classes.emphasis} {...props}>
        {children}
      </em>
    ),

    code: ({ children, className, ...props }) => {
      const language = extractLanguageFromClassName(className)
      const isCodeBlock = Boolean(language)

      if (!isCodeBlock) {
        return (
          <code className={classes.code.inline} {...props}>
            {children}
          </code>
        )
      }

      return (
        <div className="mb-4">
          <div className={classes.code.header}>
            <span className="font-mono">{language || 'code'}</span>
            <span className="text-xs opacity-75">コード</span>
          </div>
          <pre className={classes.code.block}>
            <code>{children}</code>
          </pre>
        </div>
      )
    },

    blockquote: ({ children, ...props }) => (
      <blockquote className={classes.quote} {...props}>
        {children}
      </blockquote>
    ),

    a: ({ children, href, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.link}
        {...props}
      >
        {children}
      </a>
    ),

    hr: ({ ...props }) => (
      <hr className={classes.divider} {...props} />
    ),

    table: ({ children, ...props }) => (
      <div className={classes.table.container}>
        <table className={classes.table.table} {...props}>
          {children}
        </table>
      </div>
    ),
    
    th: ({ children, ...props }) => (
      <th className={classes.table.th} {...props}>
        {children}
      </th>
    ),
    
    td: ({ children, ...props }) => (
      <td className={classes.table.td} {...props}>
        {children}
      </td>
    ),
  }
}

export function MarkdownRenderer({ 
  content, 
  className,
  variant = 'default' 
}: MarkdownRendererProps) {
  const components = createMarkdownComponents(variant)
  const isChat = variant === 'chat'

  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      isChat && "prose-invert",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 