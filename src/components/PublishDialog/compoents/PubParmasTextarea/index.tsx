// src/components/PublishDialog/compoents/PubParmasTextarea/index.tsx
"use client"

import type { IImgFile, PubItem } from '../../publishDialog.type'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseTopicString } from '@/utils'
import { usePublishDialog } from '../../usePublishDialog'
import { cn } from '@/lib/utils'

interface PubParmasTextareaProps {
  pubItem: PubItem
  onImageToImage?: (imageFile: IImgFile) => void
  onParamsChange?: (values: { value?: string, imgs?: IImgFile[], video?: any }) => void
  isMobile?: boolean
  rows?: number
  platType?: any
  desValue?: string
  imageFileListValue?: IImgFile[]
  videoFileValue?: any
  extend?: React.ReactNode
}

export const PubParmasTextarea = memo((props: PubParmasTextareaProps) => {
  const {
    pubItem,
    onImageToImage,
    onParamsChange,
    isMobile,
    rows = 8,
    desValue,
    imageFileListValue,
    videoFileValue,
    extend,
  } = props

  const { setOnePubParams } = usePublishDialog(useShallow(state => ({ setOnePubParams: state.setOnePubParams })))

  const handleDesChange = useCallback((value: string) => {
    const { topics } = parseTopicString(value)
    onParamsChange?.({ value, imgs: pubItem.params.images, video: pubItem.params.video })
    setOnePubParams({ des: value, topics }, pubItem.account.id)
  }, [pubItem.account.id, pubItem.params.images, pubItem.params.video, setOnePubParams, onParamsChange])

  return (
    <div className="space-y-3">
      {/* 扩展内容（如标题输入） */}
      {extend}

      {/* 话题输入 */}
      <div className={cn('flex items-center gap-2', isMobile ? 'flex-col' : 'h-8')}>
        <Label className={cn('shrink-0', isMobile ? 'text-sm' : 'w-[90px]')}>话题</Label>
        <Input
          className="flex-1"
          placeholder="添加话题，用逗号分隔"
          value={pubItem.params.topics?.join(', ') || ''}
          onChange={(e) => {
            const topics = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            setOnePubParams({ topics }, pubItem.account.id)
          }}
        />
      </div>

      {/* 正文输入 */}
      <div>
        <Textarea
          rows={rows}
          placeholder="输入内容描述..."
          value={desValue ?? pubItem.params.des ?? ''}
          onChange={(e) => handleDesChange(e.target.value)}
          className="resize-none"
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {(desValue ?? pubItem.params.des ?? '').length} / 2000
        </div>
      </div>
    </div>
  )
})

PubParmasTextarea.displayName = 'PubParmasTextarea'
export default PubParmasTextarea