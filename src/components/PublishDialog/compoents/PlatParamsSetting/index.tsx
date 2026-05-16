// src/components/PublishDialog/compoents/PlatParamsSetting/index.tsx
"use client"

import { memo } from 'react'
import type { PubItem } from '@/components/PublishDialog/publishDialog.type'
import { PlatType } from '@/app/config/platConfig'
import DouyinParams from './plats/DouyinParams'
import XhsParams from './plats/XhsParams'
import BilibParams from './plats/BilibParams'
import KwaiParams from './plats/KwaiParams'

interface PlatParamsSettingProps {
  pubItem: PubItem
  onImageToImage?: (imageFile: any) => void
  isMobile?: boolean
  style?: React.CSSProperties
}

export const PlatParamsSetting = memo(({ pubItem, onImageToImage, isMobile, style }: PlatParamsSettingProps) => {
  const platType = pubItem.account.type as PlatType

  const renderParams = () => {
    switch (platType) {
      case PlatType.Douyin:
        return <DouyinParams pubItem={pubItem} onImageToImage={onImageToImage} isMobile={isMobile} />
      case PlatType.Xhs:
        return <XhsParams pubItem={pubItem} onImageToImage={onImageToImage} isMobile={isMobile} />
      case PlatType.BILIBILI:
        return <BilibParams pubItem={pubItem} onImageToImage={onImageToImage} isMobile={isMobile} />
      case PlatType.KWAI:
        return <KwaiParams pubItem={pubItem} onImageToImage={onImageToImage} isMobile={isMobile} />
      default:
        return <DouyinParams pubItem={pubItem} onImageToImage={onImageToImage} isMobile={isMobile} />
    }
  }

  return <div style={style}>{renderParams()}</div>
})

PlatParamsSetting.displayName = 'PlatParamsSetting'
export default PlatParamsSetting