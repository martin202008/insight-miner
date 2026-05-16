// src/components/PublishDialog/compoents/PlatParamsSetting/plats/plats.type.ts
import type { IImgFile, PubItem } from '../../../publishDialog.type'

export interface IPlatsParamsProps {
  pubItem: PubItem
  onImageToImage?: (imageFile: IImgFile) => void
  isMobile?: boolean
}

export interface IPlatsParamsRef {
  // Placeholder for future ref methods
}