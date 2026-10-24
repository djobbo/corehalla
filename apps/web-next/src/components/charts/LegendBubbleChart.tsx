import { useMemo } from "react"
import { BubbleChart } from "@/components/charts/BubbleChart"
import { formatMetric } from "@/lib/bubbles"
import { toLegendBubbles } from "@/lib/legendBubbles"
import type { LegendBubble, PlayerLegend } from "@crh/api-contract/schemas"

/** A few mains dominate a legend roster, so exaggerate the playtime spread. */
const SCALE_EXPONENT = 1.1

export const LegendBubbleChart = ({
    legends,
}: {
    readonly legends: readonly (LegendBubble | PlayerLegend)[]
}) => {
    const bubbles = useMemo(() => toLegendBubbles(legends), [legends])

    return (
        <BubbleChart
            bubbles={bubbles}
            subject="Legend"
            caption="Top playtime legends"
            metricHeading="Playtime"
            formatValue={(bubble) => formatMetric(bubble, "matchtime")}
            scaleExponent={SCALE_EXPONENT}
            unit="played"
            idPrefix="legend"
        />
    )
}
