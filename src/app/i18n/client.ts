"use client"

import type { SocialAccount } from '@/components/PublishDialog/publishDialog.type'

// Simple translation stub - returns key as value for now
const translations: Record<string, Record<string, string>> = {
  publish: {
    'badges.offline': '离线',
    'tips.accountOffline': '账号已离线，请重新授权',
    'title': '发布内容',
    'tips.selectAccount': '请先选择要发布的账号',
    'button.nextStep': '下一步',
    'button.publish': '发布',
    'button.publishing': '发布中...',
  }
}

export function useTransClient(namespace: string) {
  return {
    t: (key: string) => {
      return translations[namespace]?.[key] || key
    }
  }
}