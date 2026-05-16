"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function LoginDialog({ open, onClose, defaultTab = 'login' }: LoginDialogProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="订正星" className="w-8 h-8" />
          <h2 className="text-xl font-bold">
            {tab === 'login' ? '登录' : '注册'}
          </h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-sm rounded ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            登录
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-sm rounded ${tab === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <Input
                placeholder="用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '处理中...' : tab === 'login' ? '登录' : '注册'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {tab === 'login' ? (
            <>还没有账号？<button onClick={() => setTab('register')} className="text-primary hover:underline">注册</button></>
          ) : (
            <>已有账号？<button onClick={() => setTab('login')} className="text-primary hover:underline">登录</button></>
          )}
        </p>
      </div>
    </div>
  );
}