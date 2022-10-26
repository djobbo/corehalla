import * as RadixTooltip from "@radix-ui/react-tooltip"
import type { ReactNode } from "react"

type TooltipProps = {
    content: ReactNode
    children: ReactNode
    delay?: number
    side?: RadixTooltip.TooltipContentProps["side"]
    align?: RadixTooltip.TooltipContentProps["align"]
}

export const Tooltip = ({
    content,
    delay = 0,
    children,
    side = "top",
    align = "center",
}: TooltipProps) => {
    return (
        <RadixTooltip.Provider delayDuration={delay}>
            <RadixTooltip.Root>
                <RadixTooltip.Trigger className="text-left">
                    {children}
                </RadixTooltip.Trigger>
                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        side={side}
                        align={align}
                        className="px-4 py-2 bg-bgVar2 border border-bg rounded-lg shadow-md hidden hashover:block z-50"
                    >
                        {content}
                        <RadixTooltip.Arrow className="mb-2 fill-bg" />
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    )
}
