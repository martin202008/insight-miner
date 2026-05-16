'use client';

import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn, generateId } from '@/lib/utils';
import type { Source } from '@/types';

interface Props {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
  onAnalyze: () => void;
  analyzing?: boolean;
  sourceLimit?: number;
}

export function SourcePanel({ sources, onAddSource, onRemoveSource, onAnalyze, analyzing, sourceLimit }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    const id = generateId();
    onAddSource({ id, type: 'url', url: urlInput.trim(), title: urlInput.trim(), status: 'pending', jobId: '', createdAt: new Date().toISOString() });

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'url', url: urlInput.trim() }),
      });
      const data = await res.json();
      if (data.content && data.content.length > 0) {
        onAddSource({ id, type: 'url', url: urlInput.trim(), title: data.title, content: data.content, status: 'extracted', jobId: '', createdAt: new Date().toISOString() });
      } else {
        onAddSource({ id, type: 'url', url: urlInput.trim(), title: data.title || urlInput.trim(), status: 'failed', jobId: '', createdAt: new Date().toISOString() });
      }
    } catch {
      onAddSource({ id, type: 'url', url: urlInput.trim(), status: 'failed', jobId: '', createdAt: new Date().toISOString() });
    }
    setUrlInput('');
  };

  const handleAddVideo = async () => {
    if (!videoInput.trim()) return;
    const id = generateId();
    onAddSource({ id, type: 'video', url: videoInput.trim(), title: '视频', status: 'pending', jobId: '', createdAt: new Date().toISOString() });

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video', url: videoInput.trim() }),
      });
      const data = await res.json();
      const content = data.content || data.description;
      if (content && content.length > 0) {
        onAddSource({ id, type: 'video', url: videoInput.trim(), title: data.title || '视频', content, status: 'extracted', jobId: '', createdAt: new Date().toISOString() });
      } else {
        onAddSource({ id, type: 'video', url: videoInput.trim(), title: '视频', status: 'failed', jobId: '', createdAt: new Date().toISOString() });
      }
    } catch {
      onAddSource({ id, type: 'video', url: videoInput.trim(), status: 'failed', jobId: '', createdAt: new Date().toISOString() });
    }
    setVideoInput('');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const id = generateId();
      onAddSource({ id, type: 'file', title: file.name, status: 'pending', jobId: '', createdAt: new Date().toISOString() });

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.content && data.content.length > 0) {
          onAddSource({ id, type: 'file', title: data.title || file.name, content: data.content, status: 'extracted', jobId: '', createdAt: new Date().toISOString() });
        } else {
          onAddSource({ id, type: 'file', title: file.name, status: 'failed', jobId: '', createdAt: new Date().toISOString() });
        }
      } catch {
        onAddSource({ id, type: 'file', title: file.name, status: 'failed', jobId: '', createdAt: new Date().toISOString() });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const canAnalyze = sources.length > 0 && sources.every(s => s.status === 'extracted');

  return (
    <aside className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 p-4 md:border-r md:border-border md:h-screen md:sticky md:top-0 overflow-y-auto bg-background md:bg-transparent">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest px-2">添加来源</h2>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          placeholder="粘贴网址 URL..."
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
        />
        <Button variant="secondary" size="sm" onClick={handleAddUrl}>添加</Button>
      </div>

      {/* Video Input */}
      <div className="flex gap-2">
        <Input
          placeholder="粘贴视频链接..."
          value={videoInput}
          onChange={e => setVideoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddVideo()}
        />
        <Button variant="secondary" size="sm" onClick={handleAddVideo}>添加</Button>
      </div>

      {/* File Upload */}
      <div
        className={cn(
          'border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer transition-colors',
          dragOver && 'border-primary bg-primary/5'
        )}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          multiple
          onChange={e => handleFileUpload(e.target.files)}
        />
        <p className="text-sm text-muted-foreground">拖拽上传 PDF / Word / TXT</p>
        <p className="text-xs text-muted-foreground/60 mt-1">或点击选择文件</p>
      </div>

      {/* Source List */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest px-2">
            来源列表 ({sources.length}{sourceLimit ? `/${sourceLimit}` : ''})
          </h3>
          {sources.map(source => (
            <div key={source.id} className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-sm text-sm">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                'bg-primary': source.status === 'extracted',
                'bg-yellow-500': source.status === 'pending',
                'bg-red-500': source.status === 'failed',
              })} />
              <span className="truncate flex-1 text-foreground">{source.title}</span>
              <button
                onClick={() => onRemoveSource(source.id)}
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analyze Button */}
      <Button
        className="w-full mt-auto"
        onClick={onAnalyze}
        disabled={!canAnalyze || analyzing}
      >
        {analyzing ? '分析中...' : '开始分析'}
      </Button>
    </aside>
  );
}
