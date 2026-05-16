// src/components/PublishDialog/publishDialog.type.ts
export interface IImgFile {
  id: string
  size: number
  file: File
  imgUrl: string
  filename: string
  imgPath: string
  width: number
  height: number
  ossUrl?: string
  uploadTaskId?: string
}

export interface IVideoFile {
  size: number
  file: Blob
  videoUrl: string
  ossUrl?: string
  filename: string
  width: number
  height: number
  duration: number
  cover: IImgFile
  uploadTaskIds?: { video?: string; cover?: string }
}

export interface IPlatOption {
  bilibili?: {
    tid?: number
    copyright?: number
    source?: string
  }
  douyin?: {
    privacy_level?: string
  }
  xhs?: {
    // 小红书特定参数
  }
  kwai?: {
    // 快手特定参数
  }
}

export interface IPubParams {
  des: string
  images?: IImgFile[]
  video?: IVideoFile
  topics?: string[]
  title?: string
  option: IPlatOption
}

export interface PubItem {
  account: SocialAccount
  params: IPubParams
}

export interface SocialAccount {
  id: string
  type: string
  nickname: string
  avatar?: string
  status: number
  uid: string
}