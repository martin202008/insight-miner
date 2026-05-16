// src/components/PublishDialog/compoents/PublishDialogAi/index.tsx
"use client"
import { memo, forwardRef } from 'react'

export interface IPublishDialogAiRef {}

interface PublishDialogAiProps {
  onClose: () => void
  onSyncToEditor: (content: string, images?: any[], video?: any, append?: boolean) => void
  chatModels: any[]
}

export const PublishDialogAi = memo(forwardRef((props: PublishDialogAiProps, ref: any) => {
  return (
    <div className="w-[300px] bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-2">AI 助手</h3>
      <p className="text-sm text-muted-foreground">AI 助手功能开发中...</p>
    </div>
  )
}))

PublishDialogAi.displayName = 'PublishDialogAi'
export default PublishDialogAi