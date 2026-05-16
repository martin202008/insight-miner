// src/components/PublishDialog/compoents/PlatParamsSetting/plats/KwaiParams.tsx
"use client"

import type { ForwardedRef } from 'react'
import type { IPlatsParamsProps, IPlatsParamsRef } from './plats.type'
import { forwardRef, memo } from 'react'
import PubParmasTextarea from '../../../compoents/PubParmasTextarea'
import { usePublishDialog } from '../../../usePublishDialog'
import { useShallow } from 'zustand/react/shallow'

const KwaiParams = memo(
  forwardRef(({ pubItem, onImageToImage, isMobile }: IPlatsParamsProps, ref: ForwardedRef<IPlatsParamsRef>) => {
    const { setOnePubParams } = usePublishDialog(useShallow(state => ({ setOnePubParams: state.setOnePubParams })))

    return (
      <PubParmasTextarea
        pubItem={pubItem}
        onImageToImage={onImageToImage}
        onParamsChange={(values) => {
          setOnePubParams(values, pubItem.account.id)
        }}
        isMobile={isMobile}
      />
    )
  }),
)

KwaiParams.displayName = 'KwaiParams'
export default KwaiParams