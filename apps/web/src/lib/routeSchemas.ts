import { z } from "zod"

/**
 * Client-safe validation schemas.
 *
 * These mirror the validators used by the tRPC procedures and by
 * `web-parser`, but are defined locally so route files and server functions
 * can import them without pulling server-only parser dependencies (cheerio,
 * axios) into the browser bundle.
 */

export const powerRankingsBracketSchema = z.union([
    z.literal("1v1"),
    z.literal("2v2"),
])

export const powerRankingsRegionSchema = z.union([
    z.literal("us-e"),
    z.literal("eu"),
    z.literal("sea"),
    z.literal("brz"),
    z.literal("aus"),
])

export const brawlhallaArticleCategorySchema = z.union([
    z.literal(""),
    z.literal("weekly-rotation"),
    z.literal("patch-notes"),
])

export const sortablePlayerProps = [
    "xp",
    "games",
    "wins",
    "rankedGames",
    "rankedWins",
    "damageDealt",
    "damageTaken",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageUnarmed",
    "koUnarmed",
    "matchTimeUnarmed",
    "koThrownItem",
    "damageThrownItem",
    "koGadgets",
    "damageGadgets",
] as const

export const sortablePlayerPropSchema = z.enum(sortablePlayerProps)

export type SortablePlayerProp = (typeof sortablePlayerProps)[number]

/**
 * Numeric path parameters (`page`, `playerId`, `clanId`).
 *
 * This validates the string form without transforming it, so the value can be
 * handed to the existing tRPC procedures, which apply the same
 * `numericLiteralValidator` and own the string -> number conversion.
 */
export const numericStringSchema = z.string().regex(/^[0-9]+$/)

/** Mirrors `rankedRegionValidator` from `bhapi/constants`. */
export const rankedRegionSchema = z.union([
    z.literal("all"),
    z.literal("us-e"),
    z.literal("eu"),
    z.literal("sea"),
    z.literal("brz"),
    z.literal("aus"),
    z.literal("us-w"),
    z.literal("jpn"),
    z.literal("sa"),
    z.literal("me"),
])

export type RankedRegion = z.infer<typeof rankedRegionSchema>

export const globalRankingsSortOptions: {
    label: string
    value: SortablePlayerProp
}[] = [
    { label: "Account XP", value: "xp" },
    { label: "Games", value: "games" },
    { label: "Wins", value: "wins" },
    { label: "Ranked Games", value: "rankedGames" },
    { label: "Ranked Wins", value: "rankedWins" },
    { label: "Damage Dealt", value: "damageDealt" },
    { label: "Damage Taken", value: "damageTaken" },
    { label: "KOs", value: "kos" },
    { label: "Falls", value: "falls" },
    { label: "Suicides", value: "suicides" },
    { label: "Team KOs", value: "teamKos" },
    { label: "Match Time", value: "matchTime" },
    { label: "Damage Unarmed", value: "damageUnarmed" },
    { label: "KOs Unarmed", value: "koUnarmed" },
    { label: "Match Time Unarmed", value: "matchTimeUnarmed" },
    { label: "KOs Thrown Item", value: "koThrownItem" },
    { label: "Damage Thrown Item", value: "damageThrownItem" },
    { label: "KOs Gadgets", value: "koGadgets" },
    { label: "Damage Gadgets", value: "damageGadgets" },
]

/**
 * Shared validator for the `?player=` / `?clan=` / `?q=` search params used by
 * the rankings routes. Unknown or non-string values fall back to an empty
 * search rather than throwing, matching the old pages-router behaviour.
 */
export const searchParamValidator = (value: unknown) =>
    typeof value === "string" ? value : ""
