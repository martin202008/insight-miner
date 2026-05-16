// src/app/config/platConfig.ts
"use client";

import { PubType } from './publishConfig'

export enum PlatType {
  Douyin = 'douyin',
  Xhs = 'xhs',
  BILIBILI = 'bilibili',
  KWAI = 'kwai',
}

export interface IAccountPlatInfo {
  themeColor: string
  icon: string
  name: string
  url: string
  pubTypes: Set<PubType>
  commonPubParamsConfig: {
    titleMax?: number
    topicMax: number
    desMax: number
    imagesMax?: number
  }
  pcNoThis?: boolean
  jiancha?: boolean
}

export const AccountPlatInfoMap = new Map<PlatType, IAccountPlatInfo>([
  [PlatType.Douyin, {
    name: 'douyin',
    icon: '',
    url: 'https://www.douyin.com',
    themeColor: '#fe2c55',
    pubTypes: new Set([PubType.VIDEO]),
    commonPubParamsConfig: { topicMax: 10, desMax: 2000 },
    jiancha: true,
  }],
  [PlatType.Xhs, {
    name: 'rednote',
    icon: '',
    url: 'https://www.xiaohongshu.com',
    themeColor: '#fe2c55',
    pubTypes: new Set([PubType.VIDEO, PubType.ImageText]),
    commonPubParamsConfig: { titleMax: 20, topicMax: 5, desMax: 1000, imagesMax: 9 },
    jiancha: true,
  }],
  [PlatType.BILIBILI, {
    name: 'bilibili',
    icon: '',
    url: 'https://www.bilibili.com',
    themeColor: '#fb7299',
    pubTypes: new Set([PubType.VIDEO]),
    commonPubParamsConfig: { titleMax: 80, topicMax: 10, desMax: 2000 },
    jiancha: true,
  }],
  [PlatType.KWAI, {
    name: 'kwai',
    icon: '',
    url: 'https://www.kuaishou.com',
    themeColor: '#ff4906',
    pubTypes: new Set([PubType.VIDEO]),
    commonPubParamsConfig: { topicMax: 8, desMax: 500 },
    jiancha: false,
  }],
])

export function isPlatformAvailable(type: PlatType): boolean {
  return AccountPlatInfoMap.has(type)
}