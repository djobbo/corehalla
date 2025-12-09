import { CollapseSectionIcon, ExpandSectionIcon } from "ui/icons"
import { Content, Root, Trigger } from "@radix-ui/react-collapsible"
import { cn } from "common/helpers/classnames"
import { useState } from "react"
import type { ReactNode } from "react"

export type CollapsibleContentProps = {
    className?: string
    triggerClassName?: string
    contentClassName?: string
    children: ReactNode
    trigger: ReactNode | ((open: boolean) => ReactNode)
    hasArrow?: boolean
    arrowClassName?: string
    defaultOpen?: boolean
    closingArrow?: boolean
}

export const CollapsibleContent = ({
    className,
    triggerClassName,
    contentClassName,
    trigger,
    children,
    hasArrow = true,
    arrowClassName = "text-textVar1",
    defaultOpen = false,
    closingArrow,
}: CollapsibleContentProps) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <Root open={open} onOpenChange={setOpen} className={className}>
            <Trigger
                className={cn(
                    "w-full flex items-center justify-between",
                    triggerClassName,
                )}
            >
                <span className="flex-1">
                    {typeof trigger === "function" ? trigger(open) : trigger}
                </span>
                {hasArrow &&
                    (open ? (
                        <CollapseSectionIcon className={arrowClassName} />
                    ) : (
                        <ExpandSectionIcon className={arrowClassName} />
                    ))}
            </Trigger>
            <Content className={contentClassName}>
                {children}
                {closingArrow && (
                    <button
                        type="button"
                        className="w-full flex items-center justify-center mt-4 text-textVar1"
                        onClick={() => setOpen(false)}
                    >
                        <CollapseSectionIcon />
                    </button>
                )}
            </Content>
        </Root>
    )
}
