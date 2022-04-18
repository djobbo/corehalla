import { bg, border } from "../theme"
import { cn } from "common/helpers/classnames"
import type { ReactNode } from "react"

type CardProps = {
    className?: string
    children: ReactNode
    title?: ReactNode
    titleClassName?: string
    contentClassName?: string
}

export const Card = ({
    className,
    children,
    title,
    titleClassName,
    contentClassName,
}: CardProps) => {
    return (
        <div
            className={cn(
                "rounded p-4 border w-full",
                bg("blue2"),
                border("blue4"),
                className,
            )}
        >
            {title && (
                <p
                    className={cn(
                        "inline-block uppercase rounded-md text-xs py-1 px-2",
                        bg("blue4"),
                        titleClassName,
                    )}
                >
                    {title}
                </p>
            )}
            <div className={cn("mt-2", contentClassName)}>{children}</div>
        </div>
    )
}
