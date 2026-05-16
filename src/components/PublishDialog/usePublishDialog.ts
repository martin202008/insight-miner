// src/components/PublishDialog/usePublishDialog.ts
import type { SocialAccount } from './publishDialog.type'
import type { IPubParams, PubItem } from './publishDialog.type'
import lodash from 'lodash'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { AccountPlatInfoMap, isPlatformAvailable } from '@/app/config/platConfig'
import { PubType } from '@/app/config/publishConfig'

export interface IPublishDialogStore {
  pubListChoosed: PubItem[]
  pubList: PubItem[]
  commonPubParams: IPubParams
  step: number
  expandedPubItem?: PubItem
  errParamsMap?: Record<string, string>
  warningParamsMap?: Record<string, string>
  pubTime?: string
  openLeft: boolean
  prefillLoading: boolean
}

const store: IPublishDialogStore = {
  pubListChoosed: [],
  pubTime: undefined,
  pubList: [],
  step: 0,
  commonPubParams: {
    title: '',
    des: '',
    video: undefined,
    images: [],
    option: {},
  },
  expandedPubItem: undefined,
  errParamsMap: undefined,
  warningParamsMap: undefined,
  openLeft: false,
  prefillLoading: false,
}

function getStore() {
  return lodash.cloneDeep(store)
}

export const usePublishDialog = create(
  combine(
    { ...getStore() },
    (set, get, storeApi) => {
      const methods = {
        setPrefillLoading(prefillLoading: boolean) {
          set({ prefillLoading })
        },
        setOpenLeft(openLeft: boolean) {
          set({ openLeft })
        },
        setPubListChoosed(pubListChoosed: PubItem[]) {
          set({ pubListChoosed })
        },
        setExpandedPubItem(expandedPubItem: PubItem | undefined) {
          set({ expandedPubItem })
        },
        setErrParamsMap(errParamsMap: Record<string, string>) {
          set({ errParamsMap })
        },
        setWarningParamsMap(warningParamsMap: Record<string, string>) {
          set({ warningParamsMap })
        },
        setStep(step: number) {
          set({ step })
        },
        setPubTime(pubTime: string | undefined) {
          set({ pubTime })
        },
        setPubList(pubList: PubItem[]) {
          set({ pubList })
        },
        clear() {
          set({ ...getStore() })
        },
        pubParamsInit(): IPubParams {
          return lodash.cloneDeep(get().commonPubParams)
        },
        init(account: SocialAccount[], defaultAccountIds?: string[]) {
          const pubList: PubItem[] = account.map(v => ({
            account: v,
            params: methods.pubParamsInit(),
          }))

          if (defaultAccountIds && defaultAccountIds.length > 0) {
            const validIds = defaultAccountIds.filter((id) => {
              const acc = account.find(a => a.id === id)
              return acc && acc.status !== 0 && isPlatformAvailable(acc.type as any)
            })
            const chosen = pubList.filter(p => validIds.includes(p.account.id))
            methods.setPubListChoosed(chosen)
            if (chosen.length === 1) {
              set({ expandedPubItem: chosen[0] })
            }
          }
          set({ pubList })
        },
        setAccountAllParams(pubParmas: Partial<IPubParams>) {
          const pubList = [...get().pubList]
          const commonPubParams = { ...get().commonPubParams }

          for (const key in pubParmas) {
            if (Object.hasOwn(pubParmas, key)) {
              (commonPubParams as any)[key] = (pubParmas as any)[key]
            }
          }

          for (let i = 0; i < pubList.length; i++) {
            const v = pubList[i]
            const platConfig = AccountPlatInfoMap.get(v.account.type as any)
            if (!platConfig) continue
            const newParams = { ...v.params }
            let needUpdate = false

            if (pubParmas.des !== undefined) {
              newParams.des = pubParmas.des
              needUpdate = true
            }
            if (pubParmas.title !== undefined) {
              newParams.title = pubParmas.title
              needUpdate = true
            }
            if (Object.hasOwn(pubParmas, 'video') && platConfig.pubTypes.has(PubType.VIDEO)) {
              newParams.video = pubParmas.video
              needUpdate = true
            }
            if (Object.hasOwn(pubParmas, 'images') && platConfig.pubTypes.has(PubType.ImageText)) {
              newParams.images = pubParmas.images
              needUpdate = true
            }
            if (pubParmas.option) {
              newParams.option = lodash.merge({}, v.params.option, pubParmas.option)
              needUpdate = true
            }
            if (pubParmas.topics !== undefined) {
              newParams.topics = pubParmas.topics
              needUpdate = true
            }

            if (needUpdate) {
              pubList[i] = { ...v, params: newParams }
            }
          }

          const currentPubListChoosed = get().pubListChoosed.map((v) => {
            const findData = pubList.find(k => k.account.id === v.account.id)
            return findData || v
          })

          set({ pubList, commonPubParams, pubListChoosed: currentPubListChoosed })
        },
        setOnePubParams(pubParmas: Partial<IPubParams>, accountId: string) {
          const pubList = [...get().pubList]
          const index = pubList.findIndex(v => v.account.id === accountId)
          if (index === -1) return

          const oldItem = pubList[index]
          const newParams = { ...oldItem.params }

          if (pubParmas.option) {
            newParams.option = lodash.merge({}, oldItem.params.option, pubParmas.option)
          }
          for (const key in pubParmas) {
            if (Object.hasOwn(pubParmas, key) && key !== 'option') {
              (newParams as any)[key] = (pubParmas as any)[key]
            }
          }

          pubList[index] = { ...oldItem, params: newParams }
          set({ pubList })
        },
      }
      return methods
    },
  ),
)
