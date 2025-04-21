import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    className?: string
    indicatorClassName?: string
  }
>(
  ({
    className,
    value,
    max = 100,
    indicatorClassName,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-youtube-red transition-all",
            indicatorClassName
          )}
          style={{
            transform: `translateX(-${100 - (value || 0) / max * 100}%)`,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
