import { bg, css } from "../theme"
import { cn } from "common/helpers/classnames"
import type { ReactNode } from "react"

type KbdProps = {
    children: ReactNode
    className?: string
}

const kbdClassName = css({
    minWidth: "1.5rem",
})()

export const Kbd = ({ children, className }: KbdProps) => (
    <kbd
        className={cn(
            kbdClassName,
            "rounded-md flex items-center justify-center",
            bg("blue3"),
            className,
        )}
    >
        {children}
    </kbd>
)
