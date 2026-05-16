"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { PromptGrid } from "./components/PromptGrid";
import { OptimizeDialog } from "./components/OptimizeDialog";
import { PromptDetailDialog } from "./components/PromptDetailDialog";
import { PromptTemplate, TOOLS, SCENES, PROMPT_TEMPLATES } from "@/lib/data/prompts";
import type { Tool, Scene } from "@/lib/data/prompts";

export default function PromptsPage() {
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | "all">("all");
  const [selectedScenes, setSelectedScenes] = useState<Scene[]>([]);
  const [optimizingTemplate, setOptimizingTemplate] = useState<PromptTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return PROMPT_TEMPLATES.filter((template) => {
      if (search && !template.title.includes(search) && !template.description.includes(search)) {
        return false;
      }
      if (selectedTool !== "all" && template.tool !== selectedTool) {
        return false;
      }
      if (selectedScenes.length > 0 && !selectedScenes.some((s) => template.scenes.includes(s))) {
        return false;
      }
      return true;
    });
  }, [search, selectedTool, selectedScenes]);

  const handleCopy = async (template: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("复制失败", err);
    }
  };

  const handleOptimize = (template: PromptTemplate) => {
    setOptimizingTemplate(template);
  };

  const handleCardClick = (template: PromptTemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">提示词模板</h1>
          <p className="text-muted-foreground">
            精选提示词模板，助你高效使用 AI 工具
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            selectedScenes={selectedScenes}
            onScenesChange={setSelectedScenes}
          />
        </div>

        <PromptGrid
          templates={filteredTemplates}
          onCopy={handleCopy}
          onOptimize={handleOptimize}
          onCardClick={handleCardClick}
          copiedId={copiedId}
        />
      </div>

      {optimizingTemplate && (
        <OptimizeDialog
          template={optimizingTemplate}
          onClose={() => setOptimizingTemplate(null)}
        />
      )}

      {selectedTemplate && (
        <PromptDetailDialog
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onCopy={handleCopy}
          onOptimize={handleOptimize}
          isCopied={copiedId === selectedTemplate.id}
        />
      )}
    </div>
  );
}