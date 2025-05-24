'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react'
import { Progress } from '~/components/ui/progress'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedFileTypes: string[]
  maxSize?: number
  title: string
  description: string
  currentFile?: File | null
  onRemoveFile?: () => void
  isUploading?: boolean
  uploadProgress?: number
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes,
  maxSize = 10 * 1024 * 1024, // 10MB default
  title,
  description,
  currentFile,
  onRemoveFile,
  isUploading = false,
  uploadProgress = 0
}: FileUploadProps) {
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (isUploading) return // アップロード中は新しいファイルを受け付けない
    
    setError('')
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`ファイルサイズが大きすぎます。${Math.round(maxSize / 1024 / 1024)}MB以下にしてください。`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('サポートされていないファイル形式です。')
      } else {
        setError('ファイルアップロードエラーです。')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect, maxSize, isUploading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled: isUploading
  })

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-8 w-8 text-white" />
    } else if (file.type.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-white" />
    }
    return <FileText className="h-8 w-8 text-white" />
  }

  if (currentFile) {
    return (
      <div className="border-2 border-emerald-300 border-dashed rounded-xl p-6 bg-gradient-to-r from-emerald-50 to-green-50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              {getFileIcon(currentFile)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{currentFile.name}</p>
              <p className="text-xs text-gray-600">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB • アップロード完了
              </p>
            </div>
          </div>
          {onRemoveFile && (
            <button
              onClick={onRemoveFile}
              className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isUploading) {
    return (
      <div className="border-2 border-blue-300 border-dashed rounded-xl p-8 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            PDFファイルをアップロード中
          </h3>
          <div className="max-w-md mx-auto">
            <Progress 
              value={uploadProgress} 
              variant="default" 
              size="lg"
              animated={true}
            />
          </div>
          <p className="text-sm text-blue-600 mt-4">
            しばらくお待ちください...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
          isDragActive
            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 scale-[1.02] shadow-lg'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
        }`}
      >
        <input {...getInputProps()} />
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
          isDragActive 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 scale-110' 
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}>
          <Upload className={`h-8 w-8 text-white transition-transform duration-300 ${
            isDragActive ? 'scale-110' : ''
          }`} />
        </div>
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          isDragActive ? 'text-blue-800' : 'text-gray-900'
        }`}>
          {isDragActive ? 'ファイルをドロップしてください' : title}
        </h3>
        <p className={`mt-2 text-sm transition-colors duration-300 ${
          isDragActive ? 'text-blue-600' : 'text-gray-600'
        }`}>
          {isDragActive ? 'ここにファイルをドロップ' : description}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            最大サイズ: {Math.round(maxSize / 1024 / 1024)}MB
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            PDF形式をサポート
          </span>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}
    </div>
  )
} 