import { Schema } from "effect"

export const powerRankingsOrderBy = [
    "top8",
    "top32",
    "gold",
    "silver",
    "bronze",
    "powerRanking",
    "points",
    "earnings",
] as const

export type PowerRankingsOrderBy = (typeof powerRankingsOrderBy)[number]

export const PowerRankingsOrderBySchema = Schema.Literals(powerRankingsOrderBy)

export const powerRankingsOrders = ["ASC", "DESC"] as const

export type PowerRankingsOrder = (typeof powerRankingsOrders)[number]

/** Brawltools sorts ascending by power rank, descending for other columns. */
export const powerRankingsOrderFor = (
    orderBy: PowerRankingsOrderBy,
): PowerRankingsOrder => (orderBy === "powerRanking" ? "ASC" : "DESC")

export const formatPowerRankingsOrderByWire = (
    orderBy: PowerRankingsOrderBy,
): string => `${orderBy} ${powerRankingsOrderFor(orderBy)}`
