import { Schema } from "effect"

export const rankedBrackets = ["1v1", "2v2", "rotating"] as const

export type RankedBracket = (typeof rankedBrackets)[number]

export const RankedBracketSchema = Schema.Literals(rankedBrackets)
