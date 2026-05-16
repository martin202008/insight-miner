// src/components/PublishDialog/compoents/PlatParamsSetting/plats/XhsParams.tsx
"use client"

import type { ForwardedRef } from 'react'
import type { IPlatsParamsProps, IPlatsParamsRef } from './plats.type'
import { forwardRef, memo } from 'react'
import PubParmasTextarea from '../../../compoents/PubParmasTextarea'
import { usePublishDialog } from '../../../usePublishDialog'
import { useShallow } from 'zustand/react/shallow'
import CommonTitleInput from '../common/CommonTitleInput'

const XhsParams = memo(
  forwardRef(({ pubItem, onImageToImage, isMobile }: IPlatsParamsProps, ref: ForwardedRef<IPlatsParamsRef>) => {
    const { setOnePubParams } = usePublishDialog(useShallow(state => ({ setOnePubParams: state.setOnePubParams })))

    return (
      <PubParmasTextarea
        pubItem={pubItem}
        onImageToImage={onImageToImage}
        onParamsChange={(values) => {
          setOnePubParams(values, pubItem.account.id)
        }}
        extend={<CommonTitleInput pubItem={pubItem} isMobile={isMobile} />}
        isMobile={isMobile}
      />
    )
  }),
)

XhsParams.displayName = 'XhsParams'
export default XhsParams