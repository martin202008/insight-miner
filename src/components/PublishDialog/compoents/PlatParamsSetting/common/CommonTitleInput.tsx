// src/components/PublishDialog/compoents/PlatParamsSetting/common/CommonTitleInput.tsx
"use client"

import { memo } from 'react'
import type { PubItem } from '@/components/PublishDialog/publishDialog.type'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePublishDialog } from '../../../usePublishDialog'
import { useShallow } from 'zustand/react/shallow'

interface CommonTitleInputProps {
  pubItem: PubItem
  isMobile?: boolean
}

export const CommonTitleInput = memo(({ pubItem, isMobile }: CommonTitleInputProps) => {
  const { setOnePubParams } = usePublishDialog(
    useShallow(state => ({ setOnePubParams: state.setOnePubParams })),
  )

  return (
    <div className={isMobile ? 'flex flex-col gap-1.5' : 'flex items-center h-8'}>
      <Label className={isMobile ? 'text-sm font-medium' : 'w-[90px] mr-2.5 shrink-0'}>
        标题
      </Label>
      <Input
        className="flex-1"
        placeholder="输入标题"
        value={pubItem.params.title || ''}
        onChange={(e) => {
          setOnePubParams({ title: e.target.value }, pubItem.account.id)
        }}
      />
    </div>
  )
})

CommonTitleInput.displayName = 'CommonTitleInput'
export default CommonTitleInput