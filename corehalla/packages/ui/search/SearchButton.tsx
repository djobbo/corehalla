import { Kbd } from "../base/Kbd"
import { bg, border } from "../theme"
import { cn } from "common/helpers/classnames"
import { useDevice } from "common/hooks/useDevice"
import { useKBar } from "kbar"

type SearchButtonProps = {
    className?: string
}

export const SearchButton = ({ className }: SearchButtonProps) => {
    const { query } = useKBar()
    const device = useDevice()

    return (
        <button
            type="button"
            className={cn(
                className,
                "rounded-xl py-2 px-4 w-64 border-2 cursor-text text-sm flex items-center justify-between",
                border("blue4"),
                bg("blue1"),
            )}
            onClick={query.toggle}
        >
            <span>Search player...</span>
            {["mac", "pc"].includes(device) && (
                <span className="flex items-center gap-1">
                    {device === "mac" ? <Kbd>⌘</Kbd> : <Kbd>Ctrl</Kbd>}
                    <Kbd>K</Kbd>
                </span>
            )}
        </button>
    )
}
