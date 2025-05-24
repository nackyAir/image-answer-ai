'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void
  disabled?: boolean
  placeholder?: string
  allowedFileTypes?: string[]
  isPdfUploaded?: boolean
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "メッセージを入力...",
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  isPdfUploaded = false
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!message.trim() && !selectedFile) return
    
    onSendMessage(message.trim(), selectedFile || undefined)
    setMessage('')
    setSelectedFile(null)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />
    } else if (file.type.includes('image')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getPlaceholderText = () => {
    if (!isPdfUploaded) {
      return "まずPDFファイルをアップロードしてください..."
    }
    return placeholder
  }

  return (
    <div className="p-6">
      {/* ファイル選択表示 */}
      {selectedFile && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                {getFileIcon(selectedFile)}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">{selectedFile.name}</span>
                <p className="text-xs text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-end">
        {/* ファイル添付ボタン */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 h-12 w-12 rounded-xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-blue-300 transition-all duration-200 shadow-sm"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* メッセージ入力 */}
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              disabled={disabled || !isPdfUploaded}
              className="w-full resize-none rounded-xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100/50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                height: 'auto'
              }}
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || (!message.trim() && !selectedFile) || !isPdfUploaded}
          size="icon"
          className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFileTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ヘルプテキスト */}
      <div className="mt-3 text-xs text-gray-500 px-1">
        {!isPdfUploaded ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span>PDFをアップロードして教材を分析した後、問題の画像を送信できます</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Enter で送信、Shift+Enter で改行 • 画像ファイル (JPEG, PNG, WebP) をサポート</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ファイル入力の隠しコンポーネント
export function HiddenFileInput() {
  return (
    <input
      type="file"
      className="hidden"
      id="file-input"
    />
  )
} 