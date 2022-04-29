import Tippy from "@tippyjs/react"
import type { TippyProps } from "@tippyjs/react"

export const Tooltip = ({ className, duration, ...props }: TippyProps) => (
    <Tippy
        className={
            className ??
            "px-4 py-2 bg-bgVar2 border border-bg rounded-xl shadow-md"
        }
        duration={duration ?? 0}
        {...props}
    />
)
