"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface PublishResult {
  success: boolean;
  mediaId?: string;
  msgId?: string;
  index?: number;
  articleId?: string;
  url?: string;
  error?: string;
}

interface ArticleEditorProps {
  title: string;
  content: string;
  tags: string[];
  coverResult?: { prompt: string; images: string[] } | null;
  onPublish?: (result: PublishResult) => void;
}

export function ArticleEditor({ title, content, tags, coverResult, onPublish }: ArticleEditorProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [editedTags, setEditedTags] = useState<string[]>(tags);
  const [author, setAuthor] = useState("");
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedTitle(title);
    setEditedContent(content);
    setEditedTags(tags);
  }, [title, content, tags]);

  const handlePublish = async () => {
    if (!editedTitle.trim()) { setError("请输入标题"); return; }
    if (!editedContent.trim()) { setError("请输入正文内容"); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/wechat/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle.trim(),
          content: editedContent,
          author: author.trim(),
          digest: digest.trim() || editedContent.slice(0, 120),
          coverImageUrl: coverResult?.images?.[0] || "",
          tags: editedTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发布失败");
      setResult(data);
      onPublish?.(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "发布失败";
      setError(errorMsg);
      setResult({ success: false, error: errorMsg });
      onPublish?.({ success: false, error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((t) => t !== tagToRemove));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = e.currentTarget;
      const newTag = input.value.trim().replace(",", "");
      if (newTag && !editedTags.includes(newTag) && editedTags.length < 8) {
        setEditedTags([...editedTags, newTag]);
        input.value = "";
      }
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Send className="w-4 h-4" />
        发布到微信公众号
      </h3>

      {/* Cover image indicator */}
      {coverResult?.images && coverResult.images.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={coverResult.images[0]} alt="封面" className="w-10 h-10 object-cover rounded" />
            <div className="text-xs">
              <p className="text-foreground font-medium">封面图已生成</p>
              <p className="text-muted-foreground">将随文章一起发布</p>
            </div>
          </div>
          <button onClick={() => {/* noop - just indicator */}} className="text-xs text-primary flex-shrink-0">已确认</button>
        </div>
      )}

      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          文章标题 <span className="text-destructive">*</span>
        </label>
        <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="输入文章标题"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={64} />
        <p className="text-xs text-muted-foreground mt-1">{editedTitle.length} / 64 字符</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">作者</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者名称"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" maxLength={15} />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">摘要</label>
          <input type="text" value={digest} onChange={(e) => setDigest(e.target.value)} placeholder="简短摘要"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" maxLength={120} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">标签（按回车添加，最多8个）</label>
        <div className="flex flex-wrap gap-1.5 p-2 bg-background border border-border rounded-lg min-h-[42px]">
          {editedTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded flex items-center gap-1">
              #{tag}
              <button onClick={() => handleTagRemove(tag)} className="hover:text-destructive/70">×</button>
            </span>
          ))}
          {editedTags.length < 8 && (
            <input type="text" onKeyDown={handleTagAdd}
              placeholder={editedTags.length === 0 ? "输入标签后按回车" : ""}
              className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          正文内容 <span className="text-destructive">*</span>
        </label>
        <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none h-40 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="文章正文内容" />
        <p className="text-xs text-muted-foreground mt-1">{editedContent.length} / 20000 字符</p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {result?.success && (
        <div className="p-3 bg-primary/10 border border-primary/50 rounded-lg text-sm text-primary flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <div>
            <p className="font-medium">草稿创建成功！</p>
            {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline hover:brightness-110">查看草稿</a>}
          </div>
        </div>
      )}

      <button onClick={handlePublish} disabled={loading || !editedTitle.trim() || !editedContent.trim()}
        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
        {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>发布中...</span></>) : (<><Send className="w-4 h-4" /><span>保存到微信公众号草稿</span></>)}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        草稿将保存到微信公众号后台，请前往微信公众平台编辑并发布
      </p>
    </div>
  );
}