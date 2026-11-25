import { metaFloors } from "@crh/api-contract/schemas"
import type { MetaFloor } from "@crh/api-contract/schemas"

/** Locale pinned: meta boards are server-rendered, so both sides must agree. */
export const formatMetaCount = (value: number): string =>
    value.toLocaleString("en-US")

export const metaFloorLabel = (floor: MetaFloor): string =>
    floor === "all" ? "All" : `${floor}+`

export const metaFloorSample = (accounts: number, floor: MetaFloor): string =>
    `Across ${formatMetaCount(accounts)} indexed accounts${
        floor === "all" ? "" : ` at ${floor}+ rating`
    }`

export const metaEmpty = (
    subject: "legend" | "weapon",
    floor: MetaFloor,
): string =>
    floor === "all"
        ? `No ${subject} games are indexed yet.`
        : `No ${subject} games are indexed at ${floor}+ rating yet.`

/** The sample is Corehalla's index, never the official ladder. */
export const metaDisclaimer =
    "aggregated from Corehalla's index, not official Brawlhalla figures."

export const isMetaFloor = (value: unknown): value is MetaFloor =>
    (metaFloors as readonly unknown[]).includes(value)

export const resolveMetaFloor = (value: unknown): MetaFloor =>
    isMetaFloor(value) ? value : "all"

/** `all` is the absence of the parameter, so the whole index has one URL. */
export const metaFloorSearch = (floor: MetaFloor): { floor?: MetaFloor } =>
    floor === "all" ? {} : { floor }
