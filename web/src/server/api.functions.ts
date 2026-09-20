import { createServerFn } from "@tanstack/react-start"
import {
    brawlhallaArticleCategorySchema,
    numericStringSchema,
    powerRankingsBracketSchema,
    powerRankingsRegionSchema,
    rankedRegionSchema,
    sortablePlayerPropSchema,
} from "./schemas"
import { getCaller } from "./caller.server"
import { z } from "zod"

/**
 * Typed server functions.
 *
 * Every function:
 *  1. validates its input at the server boundary with a zod schema, and
 *  2. delegates to the existing tRPC procedure through the server-only caller.
 *
 * They are safe to import from route loaders, route components, and client
 * event handlers — the build replaces the handler with an RPC stub in the
 * browser bundle.
 *
 * The schemas are defined locally (see `./schemas`) rather than imported from
 * `packages/server`, so the parameter shapes stay explicit at the boundary and
 * numeric path params are passed through as strings for the procedures to
 * convert.
 */

export const get1v1Rankings = createServerFn({ method: "GET" })
    .validator(
        z.object({
            region: rankedRegionSchema,
            page: numericStringSchema,
            name: z.string().optional(),
        }),
    )
    .handler(({ data }) => getCaller().get1v1Rankings(data))

export const get2v2Rankings = createServerFn({ method: "GET" })
    .validator(
        z.object({
            region: rankedRegionSchema,
            page: numericStringSchema,
        }),
    )
    .handler(({ data }) => getCaller().get2v2Rankings(data))

export const getClansRankings = createServerFn({ method: "GET" })
    .validator(
        z.object({
            name: z.string(),
            page: numericStringSchema,
        }),
    )
    .handler(({ data }) => getCaller().getClansRankings(data))

export const getPowerRankings = createServerFn({ method: "GET" })
    .validator(
        z.object({
            bracket: powerRankingsBracketSchema,
            region: powerRankingsRegionSchema,
        }),
    )
    .handler(({ data }) => getCaller().getPowerRankings(data))

export const getGlobalPlayerRankings = createServerFn({ method: "GET" })
    .validator(
        z.object({
            sortBy: sortablePlayerPropSchema,
            page: numericStringSchema,
        }),
    )
    .handler(({ data }) => getCaller().getGlobalPlayerRankings(data))

export const getPlayerStats = createServerFn({ method: "GET" })
    .validator(z.object({ playerId: numericStringSchema }))
    .handler(({ data }) => getCaller().getPlayerStats(data))

export const getPlayerRanked = createServerFn({ method: "GET" })
    .validator(z.object({ playerId: numericStringSchema }))
    .handler(({ data }) => getCaller().getPlayerRanked(data))

export const getPlayerAliases = createServerFn({ method: "GET" })
    .validator(z.object({ playerId: numericStringSchema }))
    .handler(({ data }) => getCaller().getPlayerAliases(data))

export const getClanStats = createServerFn({ method: "GET" })
    .validator(z.object({ clanId: numericStringSchema }))
    .handler(({ data }) => getCaller().getClanStats(data))

export const searchPlayerAlias = createServerFn({ method: "GET" })
    .validator(
        z.object({
            alias: z.string(),
            page: numericStringSchema,
        }),
    )
    .handler(({ data }) => getCaller().searchPlayerAlias(data))

export const getWeeklyRotation = createServerFn({ method: "GET" }).handler(
    () => getCaller().getWeeklyRotation(),
)

export const getBHArticles = createServerFn({ method: "GET" })
    .validator(
        z.object({
            category: brawlhallaArticleCategorySchema.default(""),
            first: z.number().min(1).default(1),
        }),
    )
    .handler(({ data }) => getCaller().getBHArticles(data))
