"use client";

import { useState, useCallback } from "react";
import { FileUploader } from "./components/FileUploader";
import { TemplateSelector } from "./components/TemplateSelector";
import { ReportPreview } from "./components/ReportPreview";
import { ExportButtons } from "./components/ExportButtons";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "parsing" | "parsed" | "error";
  preview?: string;
}

interface GeneratedReport {
  reportId: string;
  title: string;
  sections: { id: string; title: string; content: string; level: number }[];
  metadata: {
    wordCount: number;
    createdAt: string;
    fileCount: number;
  };
}

export default function ReportPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles);
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError("请上传至少一个文件");
      return;
    }
    if (!selectedTemplate) {
      setError("请选择报告模板");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setReport(null);

    try {
      // Convert files to base64 for API
      const fileData = await Promise.all(
        files.map(async (f) => {
          // Validate data URL format
          if (!f.preview || !f.preview.startsWith('data:')) {
            throw new Error(`文件 ${f.name} 格式无效，请重新上传`);
          }
          const parts = f.preview.split(",");
          if (parts.length !== 2) {
            throw new Error(`文件 ${f.name} 读取失败，请重新上传`);
          }
          // Verify base64 content is not empty
          if (!parts[1] || parts[1].length === 0) {
            throw new Error(`文件 ${f.name} 内容为空，请重新上传`);
          }
          return {
            name: f.name,
            type: f.type,
            content: parts[1],
          };
        })
      );

      const requestBody = {
        files: fileData,
        template: selectedTemplate,
      };

      console.log("[Report Page] Sending request with", fileData.length, "files");

      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(requestBody),
      });

      console.log("[Report Page] Response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `生成失败 (${response.status})`);
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">文档报告生成</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            上传文件，AI深度分析，生成专业报告
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-4 md:space-y-6">
            <FileUploader
              files={files}
              onFilesChange={handleFilesChange}
              disabled={isGenerating}
            />

            <TemplateSelector
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
              disabled={isGenerating}
            />

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || files.length === 0 || !selectedTemplate}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? "生成中..." : "生成报告"}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-secondary/30 rounded-xl p-4 md:p-6 min-h-[400px] md:min-h-[500px] flex flex-col">
            <div className="flex-1">
              <ReportPreview report={report} isLoading={isGenerating} />
            </div>

            {/* Export Buttons - below preview */}
            {report && (
              <div className="mt-4 pt-4 border-t border-border">
                <ExportButtons report={report} disabled={isGenerating} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}