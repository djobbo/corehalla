import { Schema } from "effect"

/**
 * Effect schemas for the brawltools v2 (Brawlhalla esports stats) API.
 *
 * Shapes mirror the official `@bmg-esports/sdk` types and the public docs at
 * `docs.brawltools.com/v2`; fields upstream omits when empty (socials, country,
 * platform IDs) and fields that can be `null` in placeholder rows are optional
 * and/or nullable so a decode never fails on missing data.
 */

/** brawltools game-mode codes: `1` = 1v1, `2` = 2v2. */
export const BrawltoolsGameMode = Schema.Literals([1, 2])

export type BrawltoolsGameMode = typeof BrawltoolsGameMode.Type

export const TournamentHost = Schema.Literals(["SGG", "CM"])

export type TournamentHost = typeof TournamentHost.Type

/** Present-and-null or absent — upstream uses both for "unknown". */
const optionalNullable = <S extends Schema.Constraint>(schema: S) =>
    Schema.optionalKey(Schema.NullOr(schema))

export const PlayerSchema = Schema.Struct({
    /** Null for the placeholder row returned for an unknown ID. */
    playerId: Schema.NullOr(Schema.Number),
    sggPlayerId: optionalNullable(Schema.Number),
    cmPlayerId: optionalNullable(Schema.String),
    brawlhallaId: optionalNullable(Schema.Number),
    name: optionalNullable(Schema.String),
    twitch: optionalNullable(Schema.String),
    twitter: optionalNullable(Schema.String),
    pronoun: optionalNullable(Schema.String),
    country: optionalNullable(Schema.String),
})

export type Player = typeof PlayerSchema.Type

export const PlayerPrSchema = Schema.Struct({
    top8: Schema.Number,
    top32: Schema.Number,
    gold: Schema.Number,
    silver: Schema.Number,
    bronze: Schema.Number,
    powerRanking: Schema.Number,
    region: Schema.String,
})

export type PlayerPr = typeof PlayerPrSchema.Type

export const LegendSchema = Schema.Struct({
    name: Schema.String,
    count: Schema.Number,
})

export type Legend = typeof LegendSchema.Type

export const TournamentSchema = Schema.Struct({
    id: Schema.String,
    tournamentName: Schema.String,
    eventName: optionalNullable(Schema.String),
    year: Schema.Number,
    isOfficial: Schema.Boolean,
    isTwos: Schema.Boolean,
    isOnline: Schema.Boolean,
    startTime: Schema.Number,
    host: Schema.optionalKey(TournamentHost),
})

export type Tournament = typeof TournamentSchema.Type

const nextToken = optionalNullable(Schema.String)

export const GetPlayerResponseSchema = Schema.Struct({ player: PlayerSchema })

export const PlayerTeammateSchema = Schema.Struct({
    player: PlayerSchema,
    games: Schema.Number,
    lastTeamedDate: Schema.Number,
})

export const GetPlayerTeammatesResponseSchema = Schema.Struct({
    playerTeammates: Schema.Array(PlayerTeammateSchema),
    nextToken,
})

export const GetPlayerPrResponseSchema = Schema.Struct({
    earnings: Schema.Number,
    pr: PlayerPrSchema,
})

export const PlayerPlacementSchema = Schema.Struct({
    placement: Schema.Number,
    tournament: TournamentSchema,
})

export const GetPlayerPlacementsResponseSchema = Schema.Struct({
    playerPlacements: Schema.Array(PlayerPlacementSchema),
    nextToken,
})

export const PlayerMatchSchema = Schema.Struct({
    matchId: Schema.Number,
    scores: Schema.Tuple([Schema.Number, Schema.Number]),
    legends: Schema.Array(Schema.Array(Schema.String)),
    maps: Schema.Array(Schema.String),
    opponent: Schema.Array(PlayerSchema),
})

export const GetPlayerMatchesResponseSchema = Schema.Struct({
    playerMatches: Schema.Array(PlayerMatchSchema),
})

export const GetPlayerLegendsResponseSchema = Schema.Struct({
    legends: Schema.Array(LegendSchema),
    nextToken,
})

export const GetRecentPlayerLegendResponseSchema = Schema.Struct({
    legend: LegendSchema,
})

export const SearchPlayerSchema = Schema.Struct({
    player: PlayerSchema,
    pr1v1: optionalNullable(PlayerPrSchema),
    pr2v2: optionalNullable(PlayerPrSchema),
    earnings: Schema.Number,
})

export const SearchPlayersResponseSchema = Schema.Struct({
    searchPlayers: Schema.Array(SearchPlayerSchema),
    nextToken,
})

export const MatchupSchema = Schema.Struct({
    matches: Schema.Tuple([Schema.Number, Schema.Number]),
    games: Schema.Tuple([Schema.Number, Schema.Number]),
    opponent: Schema.Array(PlayerSchema),
})

export const GetMatchupResponseSchema = Schema.Struct({
    matchups: Schema.Array(MatchupSchema),
    nextToken,
})

export const MatchupPlacementSchema = Schema.Struct({
    placements: Schema.Array(Schema.Number),
    tournament: TournamentSchema,
})

export const GetMatchupPlacementsResponseSchema = Schema.Struct({
    matchupPlacements: Schema.Array(MatchupPlacementSchema),
    nextToken,
})

export const MatchupMatchSchema = Schema.Struct({
    matchId: Schema.Number,
    scores: Schema.Array(Schema.Number),
    legends: Schema.Array(Schema.Array(Schema.String)),
    maps: Schema.Array(Schema.String),
})

export const GetMatchupMatchesResponseSchema = Schema.Struct({
    matchupMatches: Schema.Array(MatchupMatchSchema),
})

export const ListEventsResponseSchema = Schema.Struct({
    tournaments: Schema.Array(TournamentSchema),
    nextToken,
})

export const ListPrPlayerSchema = Schema.Struct({
    playerId: Schema.Number,
    playerName: Schema.String,
    twitter: optionalNullable(Schema.String),
    twitch: optionalNullable(Schema.String),
    top8: Schema.Number,
    top32: Schema.Number,
    gold: Schema.Number,
    silver: Schema.Number,
    bronze: Schema.Number,
    powerRanking: Schema.Number,
    points: Schema.Number,
    earnings: Schema.Number,
})

export type ListPrPlayer = typeof ListPrPlayerSchema.Type

export const ListPrResponseSchema = Schema.Struct({
    prPlayers: Schema.Array(ListPrPlayerSchema),
    totalPages: Schema.Number,
})

export type ListPrResponse = typeof ListPrResponseSchema.Type

export const ListPrPlayersResponseSchema = Schema.Struct({
    players: Schema.Array(
        Schema.Struct({ player: PlayerSchema, pr: PlayerPrSchema }),
    ),
})

export const ListPlayersResponseSchema = Schema.Struct({
    players: Schema.Array(PlayerSchema),
})

export type ListPlayersResponse = typeof ListPlayersResponseSchema.Type

export type GetPlayerResponse = typeof GetPlayerResponseSchema.Type
export type GetPlayerTeammatesResponse =
    typeof GetPlayerTeammatesResponseSchema.Type
export type GetPlayerPrResponse = typeof GetPlayerPrResponseSchema.Type
export type GetPlayerPlacementsResponse =
    typeof GetPlayerPlacementsResponseSchema.Type
export type GetPlayerMatchesResponse =
    typeof GetPlayerMatchesResponseSchema.Type
export type GetPlayerLegendsResponse =
    typeof GetPlayerLegendsResponseSchema.Type
export type GetRecentPlayerLegendResponse =
    typeof GetRecentPlayerLegendResponseSchema.Type
export type SearchPlayersResponse = typeof SearchPlayersResponseSchema.Type
export type GetMatchupResponse = typeof GetMatchupResponseSchema.Type
export type GetMatchupPlacementsResponse =
    typeof GetMatchupPlacementsResponseSchema.Type
export type GetMatchupMatchesResponse =
    typeof GetMatchupMatchesResponseSchema.Type
export type ListEventsResponse = typeof ListEventsResponseSchema.Type
export type ListPrPlayersResponse = typeof ListPrPlayersResponseSchema.Type
