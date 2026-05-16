import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
}

export const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, onValueChange, ...props }, ref) => (
    <input
      ref={ref}
      type="radio"
      className={cn("h-4 w-4", className)}
      onChange={(e) => onValueChange?.(e.target.value)}
      {...props}
    />
  )
)
RadioGroup.displayName = "RadioGroup"

export const RadioGroupItem = RadioGroup