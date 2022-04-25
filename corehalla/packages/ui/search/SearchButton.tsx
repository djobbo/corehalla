import { Kbd } from "../base/Kbd"
import { cn } from "common/helpers/classnames"
import { useDevice } from "common/hooks/useDevice"
import { useKBar } from "kbar"

type SearchButtonProps = {
    className?: string
    bg?: string
}

export const SearchButton = ({ className, bg }: SearchButtonProps) => {
    const { query } = useKBar()
    const device = useDevice()

    return (
        <button
            type="button"
            className={cn(
                className,
                "rounded-xl py-2 px-4 w-64 cursor-text text-sm flex items-center justify-between border border-bg text-textVar1 hover:text-text hover:border-textVar1",
                bg ?? "bg-bgVar2",
            )}
            onClick={query.toggle}
        >
            <span>Search player...</span>
            {["mac", "pc"].includes(device) && (
                <span className="flex items-center gap-1 text-textVar1">
                    {device === "mac" ? <Kbd>⌘</Kbd> : <Kbd>Ctrl</Kbd>}
                    <Kbd>k</Kbd>
                </span>
            )}
        </button>
    )
}
