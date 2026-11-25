import { metaFloors } from "@crh/api-contract/schemas"
import { cn } from "@/lib/cn"
import { metaFloorLabel } from "@/lib/metaFloor"
import type { MetaFloor } from "@crh/api-contract/schemas"

export type MetaFloorChipsProps = {
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}

export const MetaFloorChips = ({
    floor,
    onFloorChange,
}: MetaFloorChipsProps) => (
    <fieldset className="flex min-w-0 flex-col gap-1">
        <legend className="ch-stat-label">Rating floor</legend>
        <div className="flex flex-wrap gap-1.5">
            {metaFloors.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={option === floor}
                    onClick={() => onFloorChange?.(option)}
                    className={cn(
                        "ch-chip",
                        option === floor ? "ch-chip-on" : "ch-chip-off",
                    )}
                >
                    {metaFloorLabel(option)}
                </button>
            ))}
        </div>
    </fieldset>
)
