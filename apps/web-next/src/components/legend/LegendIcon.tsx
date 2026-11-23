import { legendIconSrc } from "@/lib/assets"
import { useLegendIcon } from "@/lib/media"
import type { Legend } from "@crh/bhapi/types"

export const LegendIcon = ({
    legend,
    className,
}: {
    readonly legend: Legend
    readonly className?: string
}) => (
    <img
        src={useLegendIcon(
            legend.legend_name_key,
            legendIconSrc(legend.legend_name_key),
        )}
        alt=""
        className={className}
    />
)
