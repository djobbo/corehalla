import { Schema } from "effect"

export const powerRankingsGameModes = ["1v1", "2v2"] as const

export type PowerRankingsGameMode = (typeof powerRankingsGameModes)[number]

/** Values sent as the `gameMode` query parameter on the wire. */
export const powerRankingsGameModeWire = {
    "1v1": "1",
    "2v2": "2",
} as const satisfies Record<PowerRankingsGameMode, string>

export const PowerRankingsGameModeSchema = Schema.Literals(
    powerRankingsGameModes,
)
