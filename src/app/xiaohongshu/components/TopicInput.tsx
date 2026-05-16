"use client";

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TopicInput({ value, onChange, disabled }: TopicInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-foreground">
        主题输入
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="例如：分享一款提升效率的 AI 工具"
        maxLength={200}
        className="w-full h-32 bg-card border border-border rounded-lg p-4 text-foreground resize-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <p className="text-xs text-muted-foreground mt-1">
        {value.length} / 200 字符
      </p>
    </div>
  );
}
