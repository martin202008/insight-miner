"use client";

import { useCallback, useState } from "react";
import { Upload, X, File } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "parsing" | "parsed" | "error";
  preview?: string;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader({ files, onFilesChange, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          type: file.name.split(".").pop() || "unknown",
          status: "pending",
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    await addFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;
    const selectedFiles = Array.from(e.target.files);
    await addFiles(selectedFiles);
  };

  const addFiles = async (newFiles: File[]) => {
    // Check total size
    const currentTotal = files.reduce((sum, f) => sum + f.size, 0);
    const newTotal = newFiles.reduce((sum, f) => sum + f.size, 0);

    if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
      alert("文件总大小不能超过50MB");
      return;
    }

    const processed = await Promise.all(
      newFiles.map((f) => processFile(f))
    );
    onFilesChange([...files, ...processed]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-foreground">
        上传文件
      </label>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf,.docx,.md,.txt,.json"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            拖拽文件到此处，或点击上传
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持 Excel, CSV, PDF, Word, Markdown, TXT, JSON (最大10MB/文件)
          </p>
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} · {file.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
