// src/components/PublishDialog/compoents/AccountSelector/index.tsx
"use client"

import type { SocialAccount } from '../../publishDialog.type'
import type { PubItem } from '../../publishDialog.type'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTransClient } from '@/app/i18n/client'
import { AccountPlatInfoMap, PlatType } from '@/app/config/platConfig'
import AvatarPlat from '@/components/AvatarPlat'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePublishDialog } from '../../usePublishDialog'

interface AccountSelectorProps {
  onOfflineClick?: (account: SocialAccount) => void
  onPcNotSupportedClick?: (platformName: string) => void
}

export const AccountSelector = memo(({ onOfflineClick, onPcNotSupportedClick }: AccountSelectorProps) => {
  const { t } = useTransClient('publish')
  const { pubList, pubListChoosed, setPubListChoosed } = usePublishDialog(
    useShallow(state => ({
      pubList: state.pubList,
      pubListChoosed: state.pubListChoosed,
      setPubListChoosed: state.setPubListChoosed,
    })),
  )

  const handleAccountClick = (pubItem: PubItem) => {
    const isChoosed = pubListChoosed.some((v: PubItem) => v.account.id === pubItem.account.id)
    if (isChoosed) {
      setPubListChoosed(pubListChoosed.filter((v: PubItem) => v.account.id !== pubItem.account.id))
    } else {
      setPubListChoosed([...pubListChoosed, pubItem])
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {pubList.map((pubItem: PubItem) => {
        const platConfig = AccountPlatInfoMap.get(pubItem.account.type as PlatType)
        const isChoosed = pubListChoosed.some((v: PubItem) => v.account.id === pubItem.account.id)
        const isOffline = pubItem.account.status === 0

        return (
          <TooltipProvider key={pubItem.account.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'border-2 rounded-full transition-all duration-300',
                    isChoosed ? '' : 'border-transparent',
                  )}
                  style={{
                    borderColor: isChoosed && platConfig ? platConfig.themeColor : 'transparent',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isOffline) return
                    if (platConfig?.pcNoThis) {
                      onPcNotSupportedClick?.(platConfig?.name || '')
                      return
                    }
                    handleAccountClick(pubItem)
                  }}
                >
                  <div className="relative">
                    <AvatarPlat
                      className={cn(
                        'cursor-pointer transition-all duration-300 p-[1px]',
                        isChoosed && !isOffline ? '[&>img]:grayscale-0' : '[&>img]:grayscale hover:[&>img]:grayscale-0',
                      )}
                      account={pubItem.account}
                      size="large"
                      disabled={isOffline || !isChoosed}
                    />
                    {isOffline && (
                      <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {t('badges.offline')}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              {isOffline && (
                <TooltipContent>
                  {t('tips.accountOffline')}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
})

AccountSelector.displayName = 'AccountSelector'
export default AccountSelector