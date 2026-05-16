"use client";

import { reportTemplates } from "@/lib/plugins/reportTemplates";

const templateIcons: Record<string, string> = {
  industry: "📊",
  project: "📋",
  market: "🔍",
};

const templateScenarios: Record<string, string> = {
  industry: "市场规模 · 竞争格局 · 发展趋势",
  project: "项目回顾 · 成果展示 · 经验教训",
  market: "消费者洞察 · 需求分析 · 市场机会",
};

interface TemplateSelectorProps {
  selected: string | null;
  onSelect: (template: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({
  selected,
  onSelect,
  disabled,
}: TemplateSelectorProps) {
  const templates = Object.values(reportTemplates);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-foreground">
        选择报告模板
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((template) => {
          const isSelected = selected === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{templateIcons[template.id]}</span>
                <span
                  className={`font-medium text-sm ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {template.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {templateScenarios[template.id]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
