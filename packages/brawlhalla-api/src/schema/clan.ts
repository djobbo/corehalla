import { Schema } from "effect"

import { ClanRankSchema } from "../constants/clan-ranks.js"
import { BrawlhallaId, BrawlhallaName } from "./brawlhalla-id.js"

const ClanMember = Schema.Struct({
    brawlhalla_id: BrawlhallaId,
    name: BrawlhallaName,
    rank: ClanRankSchema,
    join_date: Schema.Number,
    xp: Schema.Number,
})

export const Clan = Schema.Struct({
    clan_id: BrawlhallaId,
    clan_name: BrawlhallaName,
    clan_create_date: Schema.Number,
    clan_xp: Schema.String,
    clan_lifetime_xp: Schema.optionalKey(Schema.Number),
    clan: Schema.Array(ClanMember),
})

export type Clan = typeof Clan.Type
