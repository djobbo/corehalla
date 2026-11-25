import { legends, legendsMap } from "@crh/bhapi/legends"
import { getEntitySlug, parseEntityId } from "@crh/common/helpers/entitySlug"
import type { Legend } from "@crh/bhapi/types"

export const legendSlug = (legend: Legend): string =>
    getEntitySlug(legend.legend_id, legend.bio_name)

export const legendPageHref = (slug: string): string => `/legends/${slug}`

export const legendHref = (legend: Legend): string =>
    legendPageHref(legendSlug(legend))

export const legendBoardHref = (legend: Legend): string =>
    `/rankings/career/legends/${legend.legend_id}`

export const resolveLegend = (slug: string): Legend | null => {
    const id = parseEntityId(slug)

    return id === null ? null : (legendsMap[id] ?? null)
}

export const legendAttributes = (legend: Legend) => ({
    strength: Number(legend.strength),
    dexterity: Number(legend.dexterity),
    defense: Number(legend.defense),
    speed: Number(legend.speed),
})

const sharesWeapon = (left: Legend, right: Legend): boolean =>
    left.weapon_one === right.weapon_one ||
    left.weapon_one === right.weapon_two ||
    left.weapon_two === right.weapon_one ||
    left.weapon_two === right.weapon_two

export const relatedLegends = (
    legend: Legend,
    limit: number,
): readonly Legend[] =>
    legends
        .filter(
            (entry) =>
                entry.legend_id !== legend.legend_id &&
                sharesWeapon(entry, legend),
        )
        .slice(0, limit)
