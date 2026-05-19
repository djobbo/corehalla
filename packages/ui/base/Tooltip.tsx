import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { cn } from "common/helpers/classnames"
import type { ComponentProps } from "react"
import type { ReactNode } from "react"

type TooltipPositionerProps = ComponentProps<typeof BaseTooltip.Positioner>

type TooltipProps = {
    content: ReactNode
    children: ReactNode
    delay?: number
    side?: TooltipPositionerProps["side"]
    align?: TooltipPositionerProps["align"]
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
        <BaseTooltip.Provider delay={delay}>
            <BaseTooltip.Root>
                <BaseTooltip.Trigger render={<div className="text-left" />}>
                    {children}
                </BaseTooltip.Trigger>
                <BaseTooltip.Portal>
                    <BaseTooltip.Positioner side={side} align={align}>
                        <BaseTooltip.Popup
                            className={cn(
                                className,
                                "px-4 py-2 bg-bgVar2 border border-bg rounded-lg shadow-md hidden hashover:block z-50",
                            )}
                        >
                            {content}
                            <BaseTooltip.Arrow className="mb-2 fill-bg" />
                        </BaseTooltip.Popup>
                    </BaseTooltip.Positioner>
                </BaseTooltip.Portal>
            </BaseTooltip.Root>
        </BaseTooltip.Provider>
    )
}
