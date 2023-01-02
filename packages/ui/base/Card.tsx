import { cn } from "@ch/common/helpers/classnames"
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
        <div className={cn("rounded-lg p-4 w-full bg-bg shadow-md", className)}>
            {title && (
                <p
                    className={cn(
                        "inline-block uppercase rounded-md text-xs py-1 px-2 bg-bgVar1",
                        titleClassName,
                    )}
                >
                    {title}
                </p>
            )}
            <div className={cn({ "mt-2": !!title }, contentClassName)}>
                {children}
            </div>
        </div>
    )
}
