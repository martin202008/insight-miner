"use client"
import { memo } from 'react'
interface TextSelectionToolbarProps {
  onAction: (action: any, selectedText: string) => void
}
export const TextSelectionToolbar = memo(({ onAction }: TextSelectionToolbarProps) => {
  return null
})
TextSelectionToolbar.displayName = 'TextSelectionToolbar'
export default TextSelectionToolbar