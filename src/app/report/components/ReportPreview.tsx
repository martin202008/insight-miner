"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ReportSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

interface ReportPreviewProps {
  report: {
    title: string;
    sections: ReportSection[];
    metadata: {
      wordCount: number;
      createdAt: string;
      fileCount: number;
    };
  } | null;
  isLoading?: boolean;
}

export function ReportPreview({ report, isLoading }: ReportPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["executive-summary"])
  );

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">报告生成中...</p>
          <p className="text-xs text-muted-foreground mt-1">深度分析可能需要1-2分钟</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-1">上传文件并选择模板</p>
          <p className="text-xs text-muted-foreground">点击生成按钮开始创作报告</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">{report.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {report.metadata.fileCount} 个文件 · {report.metadata.wordCount} 字 ·{" "}
          {new Date(report.metadata.createdAt).toLocaleDateString("zh-CN")}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {report.sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <div key={section.id} className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <span
                  className={`font-medium ${
                    section.level === 1 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {section.title}
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}