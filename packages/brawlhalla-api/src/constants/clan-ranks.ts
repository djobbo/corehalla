import { Schema } from "effect"

export const clanRanks = ["Leader", "Officer", "Member", "Recruit"] as const

export type ClanRank = (typeof clanRanks)[number]

export const ClanRankSchema = Schema.Literals(clanRanks)
