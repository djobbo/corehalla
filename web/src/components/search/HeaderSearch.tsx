import { HiOutlineSearch } from "@react-icons/all-files/hi/HiOutlineSearch"
import { Kbd } from "ui/base/Kbd"
import { cn } from "common/helpers/classnames"
import { useSearchHandoff } from "common/hooks/useSearchHandoff"

type HeaderSearchProps = {
    className?: string
}

/**
 * The slim header search control.
 *
 * Purely a trigger: clicking it enters the full-page search straight away, with
 * the bar focused and empty. Esc from there returns to the page you left.
 */
export const HeaderSearch = ({ className }: HeaderSearchProps) => {
    const { enterSearch } = useSearchHandoff()

    return (
        <button
            type="button"
            data-search-trigger
            aria-label="Search player or clan"
            style={{ viewTransitionName: "search-bar" }}
            onClick={() => enterSearch()}
            className={cn(
                "flex h-8 w-full items-center gap-2 rounded-lg border border-bg bg-bgVar1 px-2 text-xs text-textVar1",
                "cursor-text transition-colors hover:border-textVar1/40 hover:text-text",
                className,
            )}
        >
            <HiOutlineSearch className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search player or clan...</span>
            <Kbd className="ml-auto shrink-0">/</Kbd>
        </button>
    )
}
