import { cn } from "common/helpers/classnames"
import type { ReactNode } from "react"

type SectionTitleProps = {
    className?: string
    children: ReactNode
    hasBorder?: boolean
    customMargin?: boolean
    customPadding?: boolean
}

export const SectionTitle = ({
    children,
    className,
    hasBorder,
    customMargin,
    customPadding,
}: SectionTitleProps) => {
    return (
        <h3
            className={cn(
                "text-2xl font-semibold",
                {
                    "mt-16 mb-4": !customMargin,
                    "py-2": !customPadding,
                    "border-b border-bg": hasBorder,
                },
                className,
            )}
        >
            {children}
        </h3>
    )
}
