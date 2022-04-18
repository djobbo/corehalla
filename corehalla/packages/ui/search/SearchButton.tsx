import { bg, border } from "../theme"
import { cn } from "common/helpers/classnames"
import { useKBar } from "kbar"

type SearchButtonProps = {
    className?: string
}

export const SearchButton = ({ className }: SearchButtonProps) => {
    const { query } = useKBar()

    return (
        <button
            type="button"
            className={cn(
                className,
                "rounded-xl py-2 px-4 w-48 max-w-lg border-2 cursor-text text-sm text-left",
                border("blue4"),
                bg("blue1"),
            )}
            onClick={query.toggle}
        >
            Search player...
        </button>
    )
}
