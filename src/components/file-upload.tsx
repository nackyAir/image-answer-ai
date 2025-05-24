'use client';

import { FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '~/components/ui/progress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes: string[];
  maxSize?: number;
  title: string;
  description: string;
  currentFile?: File | null;
  onRemoveFile?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
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
  uploadProgress = 0,
}: FileUploadProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (isUploading) return; // アップロード中は新しいファイルを受け付けない

      setError('');

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(
            `ファイルサイズが大きすぎます。${Math.round(maxSize / 1024 / 1024)}MB以下にしてください。`
          );
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('サポートされていないファイル形式です。');
        } else {
          setError('ファイルアップロードエラーです。');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSize, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-8 w-8 text-white" />;
    } else if (file.type.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-white" />;
    }
    return <FileText className="h-8 w-8 text-white" />;
  };

  if (currentFile) {
    return (
      <div className="rounded-xl border-2 border-emerald-300 border-dashed bg-gradient-to-r from-emerald-50 to-green-50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg">
              {getFileIcon(currentFile)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {currentFile.name}
              </p>
              <p className="text-gray-600 text-xs">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB •
                アップロード完了
              </p>
            </div>
          </div>
          {onRemoveFile && (
            <button
              onClick={onRemoveFile}
              className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="rounded-xl border-2 border-blue-300 border-dashed bg-gradient-to-r from-blue-50 to-indigo-50 p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-4 font-semibold text-blue-800 text-lg">
            PDFファイルをアップロード中
          </h3>
          <div className="mx-auto max-w-md">
            <Progress
              value={uploadProgress}
              variant="default"
              size="lg"
              animated={true}
            />
          </div>
          <p className="mt-4 text-blue-600 text-sm">
            しばらくお待ちください...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`transform cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 hover:scale-[1.02] ${
          isDragActive
            ? 'scale-[1.02] border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
        }`}
      >
        <input {...getInputProps()} />
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            isDragActive
              ? 'scale-110 bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}
        >
          <Upload
            className={`h-8 w-8 text-white transition-transform duration-300 ${
              isDragActive ? 'scale-110' : ''
            }`}
          />
        </div>
        <h3
          className={`font-semibold text-lg transition-colors duration-300 ${
            isDragActive ? 'text-blue-800' : 'text-gray-900'
          }`}
        >
          {isDragActive ? 'ファイルをドロップしてください' : title}
        </h3>
        <p
          className={`mt-2 text-sm transition-colors duration-300 ${
            isDragActive ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {isDragActive ? 'ここにファイルをドロップ' : description}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            最大サイズ: {Math.round(maxSize / 1024 / 1024)}MB
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            PDF形式をサポート
          </span>
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="flex items-center gap-2 text-red-700 text-sm">
            <X className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
