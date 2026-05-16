"use client";

import { useState } from 'react';

interface AvatarSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}

const DEFAULT_AVATARS = [
  '/avatars/default-1.png',
  '/avatars/default-2.png',
  '/avatars/default-3.png',
  '/avatars/default-4.png',
  '/avatars/default-5.png',
  '/avatars/default-6.png',
];

export function AvatarSelector({ value, onChange, onUpload }: AvatarSelectorProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {DEFAULT_AVATARS.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => onChange(url)}
            className={`relative aspect-square rounded-full overflow-hidden border-2 ${
              value === url ? 'border-primary' : 'border-transparent'
            }`}
          >
            <img src={url} alt="默认头像" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div>
        <input
          type="file"
          id="avatar-upload"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label
          htmlFor="avatar-upload"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded border border-border bg-muted hover:bg-secondary cursor-pointer text-sm"
        >
          {uploading ? '上传中...' : '上传自定义头像'}
        </label>
      </div>
    </div>
  );
}