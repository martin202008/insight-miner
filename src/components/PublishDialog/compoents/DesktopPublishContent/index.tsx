// src/components/PublishDialog/compoents/DesktopPublishContent/index.tsx
"use client"

import type { RefObject } from 'react'
import type { IPublishDialogAiRef } from '../PublishDialogAi'
import type { IImgFile, PubItem } from '../../publishDialog.type'
import { X } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTransClient } from '@/app/i18n/client'
import AccountSelector from '../AccountSelector'
import PlatParamsSetting from '../PlatParamsSetting'
import PublishFooter from '../PublishFooter'
import PubParmasTextarea from '../PubParmasTextarea'
import { usePublishDialog } from '../../usePublishDialog'
import { cn } from '@/lib/utils'
import { parseTopicString } from '@/utils'

interface DesktopPublishContentProps {
  onClose: () => void
  chatModels: any[]
  aiAssistantRef: RefObject<IPublishDialogAiRef | null>
  onSyncToEditor: (content: string, images?: IImgFile[], video?: any, append?: boolean) => void
  onTextSelection: (action: any, selectedText: string) => void
  onImageToImage: (imageFile: IImgFile) => void
  onPublish: () => void
}

export const DesktopPublishContent = memo((props: DesktopPublishContentProps) => {
  const { onClose, onSyncToEditor, onTextSelection, onImageToImage, onPublish } = props
  const { t } = useTransClient('publish')

  const { pubList, pubListChoosed, commonPubParams, step, expandedPubItem, errParamsMap, setStep, setPubListChoosed, setAccountAllParams, setExpandedPubItem } = usePublishDialog(
    useShallow(state => ({
      pubList: state.pubList,
      pubListChoosed: state.pubListChoosed,
      commonPubParams: state.commonPubParams,
      step: state.step,
      expandedPubItem: state.expandedPubItem,
      errParamsMap: state.errParamsMap,
      setStep: state.setStep,
      setPubListChoosed: state.setPubListChoosed,
      setAccountAllParams: state.setAccountAllParams,
      setExpandedPubItem: state.setExpandedPubItem,
    })),
  )

  const handleNextStep = useCallback(() => {
    setExpandedPubItem(undefined)
    setStep(1)
  }, [setExpandedPubItem, setStep])

  const handleParamsChange = useCallback((values: { value?: string, imgs?: IImgFile[], video?: any }) => {
    const { topics } = parseTopicString(values.value || '')
    setAccountAllParams({ des: values.value, images: values.imgs, video: values.video, topics })
  }, [setAccountAllParams])

  return (
    <div className="flex-1 flex max-h-[calc(100vh-80px)]">
      {/* Main content */}
      <div className="bg-background relative z-10 rounded-lg w-[720px] flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 p-5">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-base">{t('title')}</span>
          </div>
          <X onClick={onClose} className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </div>

        {/* Account Selector */}
        <div className="px-5">
          <AccountSelector />
        </div>

        {/* Content editing area */}
        <div className="flex-1 min-h-0 overflow-auto p-5">
          {step === 0 ? (
            <>
              {pubListChoosed.length === 1 && (
                <PlatParamsSetting pubItem={pubListChoosed[0]} onImageToImage={onImageToImage} />
              )}
              {pubListChoosed.length >= 2 && (
                <PubParmasTextarea
                  pubItem={pubListChoosed[0]}
                  rows={16}
                  desValue={commonPubParams.des}
                  imageFileListValue={commonPubParams.images}
                  onParamsChange={handleParamsChange}
                  onImageToImage={onImageToImage}
                />
              )}
            </>
          ) : (
            pubListChoosed.map((v: PubItem) => (
              <PlatParamsSetting key={v.account.id} pubItem={v} style={{ marginBottom: '12px' }} onImageToImage={onImageToImage} />
            ))
          )}

          {pubListChoosed.length === 0 && (
            <div className="flex items-center justify-center text-center text-muted-foreground py-10">
              {t('tips.selectAccount')}
            </div>
          )}
        </div>

        {/* Footer */}
        <PublishFooter
          onPublish={onPublish}
          onNextStep={handleNextStep}
          hasDescription={!!commonPubParams.des}
        />
      </div>
    </div>
  )
})

DesktopPublishContent.displayName = 'DesktopPublishContent'
export default DesktopPublishContent