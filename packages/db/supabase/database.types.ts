import type {
    BHClan,
    BHPlayerAlias,
    BHPlayerData,
    BHPlayerLegend,
    BHPlayerWeapon,
    CrawlProgress,
    UserConnection,
    UserFavorite,
    UserProfile,
} from "../schema"

/**
 * Database types for the Supabase client.
 *
 * `@supabase/supabase-js` v2 takes the schema as a type argument on
 * `createClient`, which is what types `.from("Table")` and `.rpc("fn")` — the
 * v1 API typed them with a per-call generic instead.
 *
 * The row types come from the Drizzle schema (the schema owner), so this file
 * only maps them onto the shape the client expects. Adding a table to
 * `schema.ts` therefore needs a matching entry here —
 * `supabaseService.from("NewTable")` fails to compile until it has one.
 */
type Table<Row> = {
    Row: Row
    Insert: Partial<Row>
    Update: Partial<Row>
    Relationships: []
}

export interface Database {
    public: {
        Tables: {
            BHClan: Table<BHClan>
            BHPlayerAlias: Table<BHPlayerAlias>
            BHPlayerData: Table<BHPlayerData>
            BHPlayerLegend: Table<BHPlayerLegend>
            BHPlayerWeapon: Table<BHPlayerWeapon>
            CrawlProgress: Table<CrawlProgress>
            UserConnection: Table<UserConnection>
            UserFavorite: Table<UserFavorite>
            UserProfile: Table<UserProfile>
        }
        Views: Record<never, never>
        Functions: {
            search_aliases: {
                Args: {
                    search: string
                    aliases_offset: number
                    aliases_per_page: number
                }
                Returns: BHPlayerAlias[]
            }
        }
        Enums: Record<never, never>
        CompositeTypes: Record<never, never>
    }
}

export type SupabaseDatabase = Database
