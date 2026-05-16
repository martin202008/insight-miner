// src/components/PublishDialog/index.tsx
"use client"

import type { ForwardedRef } from 'react'
import type { IPublishDialogAiRef } from './compoents/PublishDialogAi'
import type { IImgFile, SocialAccount } from './publishDialog.type'
import { forwardRef, memo, useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import DesktopPublishContent from './compoents/DesktopPublishContent'
import { usePublishDialog } from './usePublishDialog'
import { cn } from '@/lib/utils'

export interface IPublishDialogRef {
  setPubTime: (pubTime?: string) => void
}

export interface IPublishDialogProps {
  open: boolean
  onClose: () => void
  accounts: SocialAccount[]
  onPubSuccess?: () => void
  defaultAccountIds?: string[]
}

const PublishDialog = memo(
  forwardRef(({ open, onClose, accounts, onPubSuccess, defaultAccountIds }: IPublishDialogProps, ref: ForwardedRef<IPublishDialogRef>) => {
    const { init, clear, setPubListChoosed, setStep, setExpandedPubItem } = usePublishDialog()

    const aiAssistantRef = useRef<IPublishDialogAiRef | null>(null)
    const hasInitRef = useRef(false)

    useEffect(() => {
      if (open) {
        if (hasInitRef.current) return
        hasInitRef.current = true
        init(accounts, defaultAccountIds)
      } else {
        hasInitRef.current = false
        setPubListChoosed([])
        setStep(0)
        setExpandedPubItem(undefined)
        clear()
      }
    }, [open, accounts, defaultAccountIds, init, clear, setPubListChoosed, setStep, setExpandedPubItem])

    const handleSyncToEditor = useCallback((content: string, images?: IImgFile[], video?: any) => {
      // AI sync stub
    }, [])

    const handleTextSelection = useCallback((action: any, selectedText: string) => {
      // Text selection AI stub
    }, [])

    const handleImageToImage = useCallback((imageFile: IImgFile) => {
      // Image to image AI stub
    }, [])

    const handlePublish = useCallback(() => {
      onPubSuccess?.()
    }, [onPubSuccess])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10">
          <DesktopPublishContent
            onClose={onClose}
            chatModels={[]}
            aiAssistantRef={aiAssistantRef}
            onSyncToEditor={handleSyncToEditor}
            onTextSelection={handleTextSelection}
            onImageToImage={handleImageToImage}
            onPublish={handlePublish}
          />
        </div>
      </div>
    )
  }),
)

PublishDialog.displayName = 'PublishDialog'
export default PublishDialog