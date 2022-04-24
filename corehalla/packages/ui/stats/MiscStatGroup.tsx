import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import type { ReactNode } from "react"

export type MiscStat = {
    name: string
    value: ReactNode
}

type MiscStatGroupProps = {
    fit?: "fit" | "fill"
    className?: string
    minItemWidth?: string
    stats: MiscStat[]
}

export const MiscStatGroup = ({
    fit = "fill",
    className,
    stats,
    minItemWidth = "10rem",
}: MiscStatGroupProps) => {
    const containerClassName = css({
        gridTemplateColumns: `repeat(auto-${fit}, minmax(${minItemWidth}, 1fr))`,
    })()

    return (
        <div
            className={cn(
                "grid gap-x-12 gap-y-6",
                containerClassName,
                className,
            )}
        >
            {stats.map(({ name, value }) => (
                <div key={name}>
                    <p className="text-xs uppercase text-blue11">{name}</p>
                    <div className="font-semibold mt-2 text-lg">{value}</div>
                </div>
            ))}
        </div>
    )
}
