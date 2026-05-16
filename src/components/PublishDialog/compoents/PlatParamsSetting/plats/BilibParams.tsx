// src/components/PublishDialog/compoents/PlatParamsSetting/plats/BilibParams.tsx
"use client"

import type { ForwardedRef } from 'react'
import type { IPlatsParamsProps, IPlatsParamsRef } from './plats.type'
import { forwardRef, memo } from 'react'
import PubParmasTextarea from '../../../compoents/PubParmasTextarea'
import { usePublishDialog } from '../../../usePublishDialog'
import { useShallow } from 'zustand/react/shallow'
import CommonTitleInput from '../common/CommonTitleInput'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const BilibParams = memo(
  forwardRef(({ pubItem, onImageToImage, isMobile }: IPlatsParamsProps, ref: ForwardedRef<IPlatsParamsRef>) => {
    const { setOnePubParams } = usePublishDialog(useShallow(state => ({ setOnePubParams: state.setOnePubParams })))

    const copyright = pubItem.params.option.bilibili?.copyright ?? 1

    return (
      <PubParmasTextarea
        pubItem={pubItem}
        onImageToImage={onImageToImage}
        onParamsChange={(values) => {
          setOnePubParams(values, pubItem.account.id)
        }}
        extend={
          <div className="space-y-3">
            <CommonTitleInput pubItem={pubItem} isMobile={isMobile} />
            <div className={isMobile ? 'flex flex-col gap-1.5' : 'flex items-center h-8'}>
              <Label className={isMobile ? 'text-sm font-medium' : 'w-[90px] mr-2.5 shrink-0'}>
                版权
              </Label>
              <RadioGroup
                className="flex-1 flex flex-row gap-4"
                value={String(copyright)}
                onValueChange={(value) => {
                  setOnePubParams(
                    { option: { bilibili: { copyright: Number(value) } } },
                    pubItem.account.id,
                  )
                }}
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="1" id="copyright-original" />
                  <Label htmlFor="copyright-original" className="text-sm font-normal cursor-pointer">
                    原创
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="2" id="copyright-reprint" />
                  <Label htmlFor="copyright-reprint" className="text-sm font-normal cursor-pointer">
                    转载
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        }
        isMobile={isMobile}
      />
    )
  }),
)

BilibParams.displayName = 'BilibParams'
export default BilibParams