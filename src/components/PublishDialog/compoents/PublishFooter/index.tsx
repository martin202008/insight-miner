// src/components/PublishDialog/compoents/PublishFooter/index.tsx
"use client"

import { memo } from 'react'
import { useTransClient } from '@/app/i18n/client'
import { Button } from '@/components/ui/button'

interface PublishFooterProps {
  onPublish: () => void
  onNextStep: () => void
  hasDescription: boolean
  createLoading?: boolean
  needsContentModeration?: boolean
  moderationLoading?: boolean
  moderationResult?: boolean | null
  moderationDesc?: string
}

export const PublishFooter = memo((props: PublishFooterProps) => {
  const { onPublish, onNextStep, hasDescription, createLoading, moderationLoading, moderationResult } = props
  const { t } = useTransClient('publish')

  return (
    <div className="border-t p-4 flex items-center justify-end gap-3">
      {onNextStep && (
        <Button variant="outline" onClick={onNextStep}>
          {t('button.nextStep')}
        </Button>
      )}
      <Button onClick={onPublish} disabled={!hasDescription || createLoading || moderationLoading}>
        {createLoading ? t('button.publishing') : t('button.publish')}
      </Button>
    </div>
  )
})

PublishFooter.displayName = 'PublishFooter'
export default PublishFooter