import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import type { ReactNode } from "react"

type KbdProps = {
    children: ReactNode
    className?: string
}

const kbdClassName = css({
    minWidth: "1.5rem",
    height: "1.5rem",
})()

export const Kbd = ({ children, className }: KbdProps) => (
    <kbd
        className={cn(
            kbdClassName,
            "rounded-md hidden hashover:flex items-center justify-center px-2 bg-bg",
            className,
        )}
    >
        {children}
    </kbd>
)
