import { Schema } from "effect"

import { BrawlhallaId, BrawlhallaName } from "./brawlhalla-id.js"

export const SearchBySteamId = Schema.Struct({
    brawlhalla_id: BrawlhallaId,
    name: BrawlhallaName,
})

export type SearchBySteamId = typeof SearchBySteamId.Type
