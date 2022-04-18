import { Content, Root, Trigger } from "@radix-ui/react-collapsible"
import { useState } from "react"
import type { ReactNode } from "react"

type CollapsibleSectionProps = {
    className?: string
    triggerClassName?: string
    contentClassName?: string
    children: ReactNode
    trigger: ReactNode
}

export const CollapsibleSection = ({
    className,
    triggerClassName,
    contentClassName,
    trigger,
    children,
}: CollapsibleSectionProps) => {
    const [open, setOpen] = useState(false)

    return (
        <Root open={open} onOpenChange={setOpen} className={className}>
            <Trigger className={triggerClassName}>{trigger}</Trigger>
            <Content className={contentClassName}>{children}</Content>
        </Root>
    )
}
