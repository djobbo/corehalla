import { z } from "zod"

export type BrawlhallaID = string | number

export const rankedTiers = [
    ["Diamond", 2000],
    ["Platinum 5", 1936],
    ["Platinum 4", 1872],
    ["Platinum 3", 1808],
    ["Platinum 2", 1744],
    ["Platinum 1", 1680],
    ["Gold 5", 1622],
    ["Gold 4", 1564],
    ["Gold 3", 1506],
    ["Gold 2", 1448],
    ["Gold 1", 1390],
    ["Silver 5", 1338],
    ["Silver 4", 1286],
    ["Silver 3", 1234],
    ["Silver 2", 1182],
    ["Silver 1", 1130],
    ["Bronze 5", 1086],
    ["Bronze 4", 1042],
    ["Bronze 3", 998],
    ["Bronze 2", 954],
    ["Bronze 1", 910],
    ["Tin 5", 872],
    ["Tin 4", 834],
    ["Tin 3", 796],
    ["Tin 2", 758],
    ["Tin 1", 720],
    ["Tin 0", 200],
] as const

const rankedTiersComplete = rankedTiers.map(([tier]) => tier)

export type RankedTier = (typeof rankedTiersComplete)[number] | "Valhallan"

const rankedRegionsSchemas = [
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
] as const

export const rankedRegionSchema = z.union(rankedRegionsSchemas).catch("all")

export const rankedRegions = rankedRegionsSchemas.map(
    (validator) => validator.value,
)

const powerRankedRegionsSchemas = [
    z.literal("na"),
    z.literal("eu"),
    z.literal("sa"),
    z.literal("sea"),
    z.literal("aus"),
] as const

export const powerRankedRegionSchema = z
    .union(powerRankedRegionsSchemas)
    .catch("na")

export const powerRankedRegions = powerRankedRegionsSchemas.map(
    (validator) => validator.value,
)

export type RankedRegion = z.infer<typeof rankedRegionSchema>

export const weapons = [
    "Grapple Hammer",
    "Sword",
    "Blasters",
    "Rocket Lance",
    "Spear",
    "Katars",
    "Axe",
    "Bow",
    "Gauntlets",
    "Scythe",
    "Cannon",
    "Orb",
    "Greatsword",
    "Battle Boots",
] as const

export type Weapon = (typeof weapons)[number]

const clanRanks = ["Leader", "Officer", "Member", "Recruit"] as const

export type ClanRank = (typeof clanRanks)[number]
