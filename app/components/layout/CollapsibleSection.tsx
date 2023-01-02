import { CollapsibleContent } from "./CollapsibleContent"
import { SectionTitle } from "./SectionTitle"
import { cn } from "@ch/common/helpers/classnames"
import type { CollapsibleContentProps } from "./CollapsibleContent"
import type { ReactNode } from "react"

type CollapsibleSectionProps = Omit<CollapsibleContentProps, "trigger"> & {
    trigger: ReactNode
}

export const CollapsibleSection = ({
    className,
    triggerClassName,
    trigger,
    defaultOpen = true,
    ...props
}: CollapsibleSectionProps) => {
    return (
        <CollapsibleContent
            className={cn("w-full", className)}
            triggerClassName={cn(
                "w-full text-left border-b border-bg my-4",
                triggerClassName,
            )}
            trigger={(open) => (
                <SectionTitle
                    customMargin
                    className={cn("mt-0 flex items-center gap-2", {
                        "text-textVar1": !open,
                    })}
                >
                    {trigger}
                </SectionTitle>
            )}
            defaultOpen={defaultOpen}
            {...props}
        />
    )
}
