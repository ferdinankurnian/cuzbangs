import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex active:scale-95 transition-all shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-[1.15rem] w-8",
        lg: "h-7 w-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3",
        default: "size-4 data-[state=checked]:translate-x-[calc(100%-2px)]",
        lg: "size-6 data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(thumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
