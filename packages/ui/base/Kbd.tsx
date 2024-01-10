import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import type { ReactNode } from "react"

type KbdProps = {
    children: ReactNode
    className?: string
}

const kbdClassName = css({
    minWidth: "1.25rem",
    height: "1.25rem",
})().className

export const Kbd = ({ children, className }: KbdProps) => (
    <kbd
        className={cn(
            kbdClassName,
            "rounded-md hidden hashover:flex items-center justify-center px-1 bg-bg text-xs",
            className,
        )}
    >
        {children}
    </kbd>
)
