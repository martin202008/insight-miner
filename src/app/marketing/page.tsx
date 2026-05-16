"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import LoginDialog from '@/components/LoginDialog'

export default function MarketingPage() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true)
    }
  }, [user, loading])

  return (
    <>
      <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">数字营销</h1>
            <p className="text-muted-foreground text-sm md:text-base">AI 帮你完成从内容创作到多平台发布</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/marketing/create" className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
              <div className="text-3xl mb-3">🎬</div>
              <h2 className="text-xl font-semibold mb-2">AI 创作</h2>
              <p className="text-muted-foreground text-sm">输入主题，AI 自动生成营销方案、视频脚本和配图文案</p>
            </Link>
            <Link href="/marketing/publish" className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
              <div className="text-3xl mb-3">📤</div>
              <h2 className="text-xl font-semibold mb-2">一键发布</h2>
              <p className="text-muted-foreground text-sm">支持抖音、小红书、B站、快手等多平台发布</p>
            </Link>
          </div>
        </div>
      </div>

      <LoginDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  )
}