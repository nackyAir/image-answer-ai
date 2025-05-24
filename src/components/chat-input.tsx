'use client';

import { FileText, Image as ImageIcon, Paperclip, Send, X } from 'lucide-react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  disabled?: boolean;
  placeholder?: string;
  allowedFileTypes?: string[];
  isPdfUploaded?: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'メッセージを入力...',
  allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  isPdfUploaded = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!message.trim() && !selectedFile) return;

    onSendMessage(message.trim(), selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (file.type.includes('image')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getPlaceholderText = () => {
    if (!isPdfUploaded) {
      return 'まずPDFファイルをアップロードしてください...';
    }
    return placeholder;
  };

  return (
    <div className="p-6">
      {/* ファイル選択表示 */}
      {selectedFile && (
        <div className="mb-4 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                {getFileIcon(selectedFile)}
              </div>
              <div>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedFile.name}
                </span>
                <p className="text-gray-600 text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 rounded-full p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* ファイル添付ボタン */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-300 hover:bg-white"
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
              className="w-full resize-none rounded-xl border-2 border-gray-200/50 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100/50"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                height: 'auto',
              }}
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <Button
          onClick={handleSubmit}
          disabled={
            disabled || (!message.trim() && !selectedFile) || !isPdfUploaded
          }
          size="icon"
          className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="mt-3 px-1 text-gray-500 text-xs">
        {isPdfUploaded ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span>
              Enter で送信、Shift+Enter で改行 • 画像ファイル (JPEG, PNG, WebP)
              をサポート
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400"></div>
            <span>
              PDFをアップロードして教材を分析した後、問題の画像を送信できます
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ファイル入力の隠しコンポーネント
export function HiddenFileInput() {
  return <input type="file" className="hidden" id="file-input" />;
}
