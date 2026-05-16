"use client"
import { useState, useEffect } from 'react'
import PublishDialog from '@/components/PublishDialog'
import type { SocialAccount } from '@/components/PublishDialog/publishDialog.type'
import { useAuth } from '@/context/AuthContext'
import LoginDialog from '@/components/LoginDialog'

export default function PublishPage() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [open, setOpen] = useState(true)
  const accounts: SocialAccount[] = [
    { id: '1', type: 'douyin', nickname: '我的抖音', avatar: '', status: 1, uid: '123' },
    { id: '2', type: 'xhs', nickname: '我的小红书', avatar: '', status: 1, uid: '456' },
    { id: '3', type: 'bilibili', nickname: '我的B站', avatar: '', status: 1, uid: '789' },
    { id: '4', type: 'kwai', nickname: '我的快手', avatar: '', status: 1, uid: '101' },
  ]

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true)
    }
  }, [user, loading])

  return (
    <>
      <div className="min-h-screen pt-20">
        <PublishDialog open={open} onClose={() => setOpen(false)} accounts={accounts} onPubSuccess={() => console.log('Published')} />
      </div>

      <LoginDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  )
}