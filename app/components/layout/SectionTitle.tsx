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
                "text-3xl font-bold",
                {
                    "mt-10 mb-4": !customMargin,
                    "py-2": !customPadding,
                    "border-b border-bg": hasBorder,
                },
                className,
            )}
        >
            <span className="bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
                {children}
            </span>
        </h3>
    )
}
