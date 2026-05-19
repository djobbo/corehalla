import RadixTooltip from "@radix-ui/react-tooltip"
import { cn } from "common/helpers/classnames"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

type TooltipContentProps = ComponentPropsWithoutRef<typeof RadixTooltip.Content>

type TooltipProps = {
    content: ReactNode
    children: ReactNode
    delay?: number
    side?: TooltipContentProps["side"]
    align?: TooltipContentProps["align"]
    className?: string
}

export const Tooltip = ({
    content,
    delay = 0,
    children,
    side = "top",
    align = "center",
    className,
}: TooltipProps) => {
    return (
        <RadixTooltip.Provider delayDuration={delay}>
            <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild className="text-left">
                    {children}
                </RadixTooltip.Trigger>
                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        side={side}
                        align={align}
                        className={cn(
                            className,
                            "px-4 py-2 bg-bgVar2 border border-bg rounded-lg shadow-md hidden hashover:block z-50",
                        )}
                    >
                        {content}
                        <RadixTooltip.Arrow className="mb-2 fill-bg" />
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    )
}
