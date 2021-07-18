import { IStaticLegendData, ILegendStats, ILegendRanked, ILegendStatsFormat } from '../../types'
import { formatLegendStats } from './formatLegendStats'

export const formatLegendsStats = (
    staticLegends: IStaticLegendData[],
    legendsStats: ILegendStats[] | undefined,
    legendsRanked: ILegendRanked[] | undefined,
): ILegendStatsFormat[] => {
    return staticLegends.map((legend) => {
        const legendStats = legendsStats?.find((l) => l.legend_id === legend.id)
        const legendRanked = legendsRanked?.find((l) => l.legend_id === legend.id)
        return formatLegendStats(legend, legendStats, legendRanked)
    })
}
