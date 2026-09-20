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
                "rounded-lg p-4 w-full bg-bgVar2/50 border border-bg/75 shadow-md",
                className,
            )}
        >
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
