"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarSelector } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateUser({ username, occupation, avatar });
      setMessage('保存成功');
    } catch (err) {
      setMessage('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">设置</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg p-6 space-y-4">
            <h2 className="font-medium">头像</h2>
            <AvatarSelector
              value={avatar}
              onChange={setAvatar}
              onUpload={handleAvatarUpload}
            />
          </div>

          <div className="bg-card rounded-lg p-6 space-y-4">
            <h2 className="font-medium">基本信息</h2>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">用户名</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="用户名"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">职业</label>
              <Input
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                placeholder="如：产品经理、设计师、学生"
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('成功') ? 'text-primary' : 'text-destructive'}`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </form>
      </div>
    </div>
  );
}