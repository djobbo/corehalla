import { Tooltip } from "ui/base/Tooltip"
import { cn } from "common/helpers/classnames"
import { css } from "ui/theme"
import type { ReactNode } from "react"

export type MiscStat = {
    name: string
    value: ReactNode
    desc: string
}

type MiscStatGroupProps = {
    fit?: "fit" | "fill"
    className?: string
    minItemWidth?: string
    stats: MiscStat[]
    gapClassName?: string
    column?: boolean
}

export const MiscStatGroup = ({
    fit = "fill",
    className,
    stats,
    minItemWidth = "8rem",
    gapClassName = "gap-x-12 gap-y-4",
    column,
}: MiscStatGroupProps) => {
    const containerClassName = column
        ? ["flex flex-col"]
        : [
              "grid",
              css({
                  gridTemplateColumns: `repeat(auto-${fit}, minmax(${minItemWidth}, 1fr))`,
              })(),
          ]

    return (
        <div className={cn(gapClassName, containerClassName, className)}>
            {stats.map(({ name, value, desc }) => (
                <div
                    key={name}
                    className={cn({
                        "flex items-center gap-2": column,
                    })}
                >
                    <Tooltip content={desc}>
                        <p className="text-sm text-textVar1">{name}</p>
                    </Tooltip>
                    <div
                        className={cn("font-semibold text-lg", {
                            "mt-2": !column,
                        })}
                    >
                        {value}
                    </div>
                </div>
            ))}
        </div>
    )
}
