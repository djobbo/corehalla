import { Data, Effect, Predicate } from "effect"
import type { Schema } from "effect"
import { HttpClient, HttpClientError, HttpClientResponse } from "effect/http"
import { retryTransient } from "../retry"
import * as S from "./schemas"

const BASE = "https://api.brawltools.com/v2"

/** Any non-404 failure: transport, non-2xx status, or schema decode. */
export class BrawltoolsError extends Data.TaggedError("BrawltoolsError")<{
    readonly operation: string
    readonly cause: unknown
}> {}

/** A 404 the caller may treat as "no such record" instead of a failure. */
export class BrawltoolsNotFound extends Data.TaggedError("BrawltoolsNotFound")<{
    readonly operation: string
}> {}

type QueryParam = string | number | boolean | null | undefined

type QueryParams = Readonly<Record<string, QueryParam>>

/** The SDK drops `undefined`/`null`/`""`; arrays are always pre-joined. */
const toUrlParams = (params: QueryParams): Record<string, string> =>
    Object.fromEntries(
        Object.entries(params)
            .filter(
                ([, value]) =>
                    value !== undefined && value !== null && value !== "",
            )
            .map(([key, value]) => [key, String(value)]),
    )

const csv = (
    values: readonly (number | string)[] | undefined,
): string | undefined => values?.join(",")

const statusOf = (error: HttpClientError.HttpClientError): number | null =>
    Predicate.isTagged(error.reason, "StatusCodeError")
        ? error.reason.response.status
        : null

const toError =
    (operation: string) =>
    (cause: unknown): BrawltoolsError | BrawltoolsNotFound =>
        HttpClientError.isHttpClientError(cause) && statusOf(cause) === 404
            ? new BrawltoolsNotFound({ operation })
            : new BrawltoolsError({ operation, cause })

export type BrawltoolsShape = {
    readonly getPlayer: (
        playerId: number,
    ) => Effect.Effect<S.GetPlayerResponse | null, BrawltoolsError>
    readonly getPlayerByBrawlhallaId: (
        brawlhallaId: number,
    ) => Effect.Effect<S.GetPlayerResponse | null, BrawltoolsError>
    readonly getPlayerBySggId: (
        sggPlayerId: number,
    ) => Effect.Effect<S.GetPlayerResponse | null, BrawltoolsError>
    readonly getPlayerByCmId: (
        cmPlayerId: string,
    ) => Effect.Effect<S.GetPlayerResponse | null, BrawltoolsError>
    readonly getPlayerTeammates: (params: {
        readonly playerId: number
        readonly nextToken?: string
        readonly isOfficial?: boolean
        readonly maxResults?: number
    }) => Effect.Effect<S.GetPlayerTeammatesResponse, BrawltoolsError>
    readonly getPlayerPr: (params: {
        readonly playerIds: readonly number[]
        readonly gameMode: S.BrawltoolsGameMode
    }) => Effect.Effect<S.GetPlayerPrResponse | null, BrawltoolsError>
    readonly getPlayerPlacements: (params: {
        readonly playerIds: readonly number[]
        readonly gameMode: S.BrawltoolsGameMode
        readonly isOfficial?: boolean
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.GetPlayerPlacementsResponse, BrawltoolsError>
    readonly getPlayerMatches: (params: {
        readonly playerIds: readonly number[]
        readonly tournamentId: string
    }) => Effect.Effect<S.GetPlayerMatchesResponse, BrawltoolsError>
    readonly getPlayerLegends: (params: {
        readonly playerIds: readonly number[]
        readonly isOfficial?: boolean
        readonly year?: number
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.GetPlayerLegendsResponse, BrawltoolsError>
    readonly getPlayerRecentLegend: (
        playerId: number,
    ) => Effect.Effect<S.GetRecentPlayerLegendResponse | null, BrawltoolsError>
    readonly searchPlayers: (params: {
        readonly query: string
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.SearchPlayersResponse, BrawltoolsError>
    readonly getMatchup: (params: {
        readonly entrant1PlayerIds: readonly number[]
        readonly entrant2PlayerIds?: readonly number[]
        readonly gameMode: S.BrawltoolsGameMode
        readonly isOfficial?: boolean
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.GetMatchupResponse, BrawltoolsError>
    readonly getMatchupPlacements: (params: {
        readonly entrant1PlayerIds: readonly number[]
        readonly entrant2PlayerIds: readonly number[]
        readonly gameMode: S.BrawltoolsGameMode
        readonly isOfficial?: boolean
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.GetMatchupPlacementsResponse, BrawltoolsError>
    readonly getMatchupMatches: (params: {
        readonly entrant1PlayerIds: readonly number[]
        readonly entrant2PlayerIds?: readonly number[]
        readonly tournamentId: string
    }) => Effect.Effect<S.GetMatchupMatchesResponse, BrawltoolsError>
    readonly listEvents: (params: {
        readonly gameMode: S.BrawltoolsGameMode
        readonly host?: S.TournamentHost
        readonly year?: number
        readonly isOfficial?: boolean
        readonly nextToken?: string
        readonly maxResults?: number
    }) => Effect.Effect<S.ListEventsResponse, BrawltoolsError>
    readonly listPr: (params: {
        readonly gameMode: S.BrawltoolsGameMode
        readonly region: string
        readonly page?: number
        readonly maxResults?: number
        readonly orderBy?: string
    }) => Effect.Effect<S.ListPrResponse, BrawltoolsError>
    readonly listPrPlayers: (params: {
        readonly gameMode: S.BrawltoolsGameMode
        readonly playerIds?: readonly number[]
        readonly bhIds?: readonly number[]
        readonly sggIds?: readonly number[]
        readonly cmIds?: readonly string[]
    }) => Effect.Effect<S.ListPrPlayersResponse, BrawltoolsError>
    readonly listPlayers: (params: {
        readonly playerIds?: readonly number[]
        readonly bhIds?: readonly number[]
        readonly sggIds?: readonly number[]
        readonly cmIds?: readonly string[]
    }) => Effect.Effect<S.ListPlayersResponse, BrawltoolsError>
}

/**
 * Builds the client from an already-configured `HttpClient`. The caller owns
 * request decoration (the API worker adds a `User-Agent`; the browser must not).
 */
export const make = (base: HttpClient.HttpClient): BrawltoolsShape => {
    const client = HttpClient.filterStatusOk(base)

    const fetchJson =
        <Sch extends Schema.Constraint>(operation: string, schema: Sch) =>
        (path: string, params: QueryParams = {}) =>
            client
                .get(`${BASE}${path}`, {
                    urlParams: toUrlParams(params),
                    acceptJson: true,
                })
                .pipe(
                    retryTransient,
                    Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
                    Effect.mapError(toError(operation)),
                )

    /** 404 → `null`. */
    const orNull =
        <Sch extends Schema.Constraint>(operation: string, schema: Sch) =>
        (path: string, params: QueryParams = {}) =>
            fetchJson(operation, schema)(path, params).pipe(
                Effect.catchTag("BrawltoolsNotFound", () =>
                    Effect.succeed(null),
                ),
            )

    /** 404 → the documented empty envelope. */
    const orEmpty =
        <Sch extends Schema.Constraint, Empty>(
            operation: string,
            schema: Sch,
            empty: Empty,
        ) =>
        (path: string, params: QueryParams = {}) =>
            fetchJson(operation, schema)(path, params).pipe(
                Effect.catchTag("BrawltoolsNotFound", () =>
                    Effect.succeed(empty),
                ),
            )

    return {
        getPlayer: (playerId) =>
            orNull(
                "getPlayer",
                S.GetPlayerResponseSchema,
            )(`/player/${playerId}`),

        getPlayerByBrawlhallaId: (brawlhallaId) =>
            orNull(
                "getPlayerByBrawlhallaId",
                S.GetPlayerResponseSchema,
            )(`/player/bhId/${brawlhallaId}`),

        getPlayerBySggId: (sggPlayerId) =>
            orNull(
                "getPlayerBySggId",
                S.GetPlayerResponseSchema,
            )(`/player/sggId/${sggPlayerId}`),

        getPlayerByCmId: (cmPlayerId) =>
            orNull(
                "getPlayerByCmId",
                S.GetPlayerResponseSchema,
            )(`/player/cmId/${cmPlayerId}`),

        getPlayerTeammates: (params) =>
            orEmpty("getPlayerTeammates", S.GetPlayerTeammatesResponseSchema, {
                playerTeammates: [],
            })("/player/teammate", {
                playerId: params.playerId,
                nextToken: params.nextToken,
                isOfficial: params.isOfficial,
                maxResults: params.maxResults,
            }),

        getPlayerPr: (params) =>
            orNull("getPlayerPr", S.GetPlayerPrResponseSchema)("/player/pr", {
                playerIds: csv(params.playerIds),
                gameMode: params.gameMode,
            }),

        getPlayerPlacements: (params) =>
            orEmpty(
                "getPlayerPlacements",
                S.GetPlayerPlacementsResponseSchema,
                { playerPlacements: [] },
            )("/player/placement", {
                playerIds: csv(params.playerIds),
                gameMode: params.gameMode,
                isOfficial: params.isOfficial,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        getPlayerMatches: (params) =>
            orEmpty("getPlayerMatches", S.GetPlayerMatchesResponseSchema, {
                playerMatches: [],
            })("/player/match", {
                playerIds: csv(params.playerIds),
                tournamentId: params.tournamentId,
            }),

        getPlayerLegends: (params) =>
            orEmpty("getPlayerLegends", S.GetPlayerLegendsResponseSchema, {
                legends: [],
            })("/player/legend", {
                playerIds: csv(params.playerIds),
                isOfficial: params.isOfficial,
                year: params.year,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        getPlayerRecentLegend: (playerId) =>
            orNull(
                "getPlayerRecentLegend",
                S.GetRecentPlayerLegendResponseSchema,
            )(`/player/${playerId}/legend`),

        searchPlayers: (params) =>
            orEmpty("searchPlayers", S.SearchPlayersResponseSchema, {
                searchPlayers: [],
            })("/player/search", {
                query: params.query,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        getMatchup: (params) =>
            orEmpty("getMatchup", S.GetMatchupResponseSchema, {
                matchups: [],
            })("/matchup", {
                entrant1PlayerIds: csv(params.entrant1PlayerIds),
                entrant2PlayerIds: csv(params.entrant2PlayerIds),
                gameMode: params.gameMode,
                isOfficial: params.isOfficial,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        getMatchupPlacements: (params) =>
            orEmpty(
                "getMatchupPlacements",
                S.GetMatchupPlacementsResponseSchema,
                { matchupPlacements: [] },
            )("/matchup/placement", {
                entrant1PlayerIds: csv(params.entrant1PlayerIds),
                entrant2PlayerIds: csv(params.entrant2PlayerIds),
                gameMode: params.gameMode,
                isOfficial: params.isOfficial,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        getMatchupMatches: (params) =>
            orEmpty("getMatchupMatches", S.GetMatchupMatchesResponseSchema, {
                matchupMatches: [],
            })("/matchup/match", {
                entrant1PlayerIds: csv(params.entrant1PlayerIds),
                entrant2PlayerIds: csv(params.entrant2PlayerIds),
                tournamentId: params.tournamentId,
            }),

        listEvents: (params) =>
            orEmpty("listEvents", S.ListEventsResponseSchema, {
                tournaments: [],
            })("/event", {
                gameMode: params.gameMode,
                host: params.host,
                year: params.year,
                isOfficial: params.isOfficial,
                nextToken: params.nextToken,
                maxResults: params.maxResults,
            }),

        listPr: (params) =>
            orEmpty("listPr", S.ListPrResponseSchema, {
                prPlayers: [],
                totalPages: 0,
            })("/pr", {
                gameMode: params.gameMode,
                region: params.region,
                page: params.page,
                maxResults: params.maxResults,
                orderBy: params.orderBy,
            }),

        listPrPlayers: (params) =>
            orEmpty("listPrPlayers", S.ListPrPlayersResponseSchema, {
                players: [],
            })("/players/pr", {
                playerIds: csv(params.playerIds),
                bhIds: csv(params.bhIds),
                sggIds: csv(params.sggIds),
                cmIds: csv(params.cmIds),
                gameMode: params.gameMode,
            }),

        listPlayers: (params) =>
            orEmpty("listPlayers", S.ListPlayersResponseSchema, {
                players: [],
            })("/players", {
                playerIds: csv(params.playerIds),
                bhIds: csv(params.bhIds),
                sggIds: csv(params.sggIds),
                cmIds: csv(params.cmIds),
            }),
    }
}

export * as schemas from "./schemas"
