"use client";

import { wechatTemplates, WeChatTemplate } from "@/lib/plugins/wechatTemplateData";

const templateIcons: Record<string, string> = {
  ganhuo: "📚",
  news: "📰",
  case: "🔍",
  interview: "🎤",
  opinion: "💬",
};

interface TemplateSelectorProps {
  selected: string | null;
  onSelect: (template: string) => void;
  disabled?: boolean;
}

export function WeChatTemplateSelector({
  selected,
  onSelect,
  disabled,
}: TemplateSelectorProps) {
  const templates = Object.values(wechatTemplates);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-foreground">
        选择模板
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template: WeChatTemplate) => {
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
                {template.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}