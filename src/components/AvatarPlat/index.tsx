"use client"

import type { SocialAccount } from '@/components/PublishDialog/publishDialog.type'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface AvatarPlatProps {
  account: SocialAccount
  size?: 'small' | 'large'
  className?: string
  disabled?: boolean
}

export const AvatarPlat = memo(({ account, size = 'large', className, disabled }: AvatarPlatProps) => {
  const sizeClasses = size === 'large' ? 'w-10 h-10' : 'w-8 h-8'

  return (
    <div className={cn('relative rounded-full bg-muted overflow-hidden', sizeClasses, className)}>
      {account.avatar ? (
        <img src={account.avatar} alt={account.nickname} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-semibold">
          {account.nickname?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  )
})

AvatarPlat.displayName = 'AvatarPlat'
export default AvatarPlat