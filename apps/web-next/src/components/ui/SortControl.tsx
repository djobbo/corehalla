import { SelectField } from "@/components/ui/SelectField"
import { cn } from "@/lib/cn"
import type { SortChoice, SortDirection } from "@/lib/useSortBy"

/**
 * A sort key picker plus a direction toggle.
 *
 * The toggle is the app's chunky button rather than a second select, because
 * flipping the direction is the one sort action taken repeatedly and it deserves
 * a single always-visible target.
 */
export const SortControl = <K extends string,>({
    label,
    value,
    choices,
    onChange,
    direction,
    onToggleDirection,
    className,
}: {
    readonly label?: string
    readonly value: K
    readonly choices: readonly SortChoice<K>[]
    readonly onChange: (value: K) => void
    readonly direction: SortDirection
    readonly onToggleDirection: () => void
    readonly className?: string
}) => {
    const nextDirection = direction === "asc" ? "descending" : "ascending"

    return (
        <div className={cn("flex min-w-0 items-end gap-2", className)}>
            <SelectField
                className="flex-1"
                label={label}
                value={value}
                options={choices}
                onChange={onChange}
            />
            <button
                type="button"
                onClick={onToggleDirection}
                className="ch-btn justify-center px-3 py-3"
                aria-label={`Sort ${nextDirection}`}
                title={`Sort ${nextDirection}`}
            >
                <span aria-hidden>{direction === "asc" ? "↑" : "↓"}</span>
            </button>
        </div>
    )
}
