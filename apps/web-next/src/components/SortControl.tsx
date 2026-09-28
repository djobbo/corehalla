import { SelectField } from "@/components/SelectField"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import type { SortChoice, SortDirection } from "@/lib/useSortBy"

/**
 * A sort key picker plus a direction toggle.
 *
 * The toggle is a button rather than a second select, because flipping the
 * direction is the one sort action taken repeatedly and it deserves a single
 * always-visible target. It is shadcn's `Button` at `icon-sm`, which already
 * carries the app's chunky slab shape and hard shadow — the icon is passed
 * through `data-icon` so the component owns its sizing (see `button.tsx`).
 *
 * The accessible name states the *next* direction, not the current one: the
 * label describes what pressing it does, which is what a screen-reader user
 * needs to hear before deciding.
 */
export const SortControl = <K extends string>({
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
    const ascending = direction === "asc"

    return (
        <div className={cn("flex min-w-0 items-end gap-2", className)}>
            <SelectField
                className="flex-1"
                label={label}
                value={value}
                options={choices}
                onChange={onChange}
            />
            <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={onToggleDirection}
                aria-label={`Sort ${nextDirection}`}
                title={`Sort ${nextDirection}`}
            >
                {ascending ? (
                    <ArrowUpIcon data-icon="inline-start" />
                ) : (
                    <ArrowDownIcon data-icon="inline-start" />
                )}
            </Button>
        </div>
    )
}
