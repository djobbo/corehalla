import { resolvePlayerFilter } from "./routeParams"
import type { Ladder } from "@crh/api-contract/schemas"

/** Only the 1v1 board has a name filter, so a `q` on the other ladders is dropped. */
const filterableLadders: ReadonlySet<Ladder> = new Set(["1v1"])

export type LadderRedirect = {
    bracket?: Ladder
    region?: string
    page?: string
    q?: unknown
}

/** The live board a legacy ladder URL forwards to, name filter included. */
export const ladderRedirectTarget = ({
    bracket = "1v1",
    region,
    page,
    q,
}: LadderRedirect): string => {
    const path = `/rankings/live/${bracket}${region ? `/${region}` : ""}${page ? `/${page}` : ""}`
    const player = filterableLadders.has(bracket)
        ? resolvePlayerFilter(q)
        : undefined

    return player === undefined
        ? path
        : `${path}?player=${encodeURIComponent(player)}`
}
