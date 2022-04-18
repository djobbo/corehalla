import { border } from "../theme"
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
                "text-xl",
                {
                    "mt-10 mb-4": !customMargin,
                    "py-2": !customPadding,
                    [border("blue6")]: hasBorder,
                    "border-b": hasBorder,
                },
                className,
            )}
        >
            {children}
        </h3>
    )
}