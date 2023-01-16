import { Kbd } from "ui/base/Kbd"
import { SearchIcon } from "ui/icons"
import { cn } from "common/helpers/classnames"
import { useDevice } from "common/hooks/useDevice"
import { useKBar } from "kbar"

type SearchButtonProps = {
    className?: string
    bg?: string
    customWidth?: boolean
}

export const SearchButton = ({
    className,
    bg,
    customWidth,
}: SearchButtonProps) => {
    const { query } = useKBar()
    const device = useDevice()

    return (
        <button
            type="button"
            className={cn(
                className,
                "rounded-lg py-1.5 px-2 cursor-text text-sm flex items-center justify-between border border-bg text-textVar1 hover:text-text hover:border-textVar1",
                {
                    "w-48": !customWidth,
                },
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

type SearchButtonIconProps = {
    className?: string
    size?: number
}

export const SearchButtonIcon = ({
    className,
    size,
}: SearchButtonIconProps) => {
    const { query } = useKBar()

    return (
        <button type="button" className={className} onClick={query.toggle}>
            <SearchIcon size={size ?? 20} />
        </button>
    )
}
