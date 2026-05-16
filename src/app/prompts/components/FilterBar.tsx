// src/app/prompts/components/FilterBar.tsx
"use client";

import { TOOLS, SCENES } from "@/lib/data/prompts";
import type { Tool, Scene } from "@/lib/data/prompts";

interface FilterBarProps {
  selectedTool: Tool | "all";
  onToolChange: (tool: Tool | "all") => void;
  selectedScenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
}

export function FilterBar({
  selectedTool,
  onToolChange,
  selectedScenes,
  onScenesChange,
}: FilterBarProps) {
  const toggleScene = (scene: Scene) => {
    if (selectedScenes.includes(scene)) {
      onScenesChange(selectedScenes.filter((s) => s !== scene));
    } else {
      onScenesChange([...selectedScenes, scene]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 工具分类 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">工具分类:</span>
        <button
          onClick={() => onToolChange("all")}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            selectedTool === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          }`}
        >
          全部
        </button>
        {TOOLS.map((tool) => (
          <button
            key={tool.value}
            onClick={() => onToolChange(tool.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              selectedTool === tool.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* 场景标签 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">场景标签:</span>
        {SCENES.map((scene) => (
          <button
            key={scene}
            onClick={() => toggleScene(scene)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedScenes.includes(scene)
                ? "bg-accent text-accent-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {scene}
          </button>
        ))}
      </div>
    </div>
  );
}