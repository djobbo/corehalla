import { Effect, Option } from "effect"
import { Atom, AtomRegistry, Hydration } from "effect/reactivity"
import * as AsyncResult from "effect/reactivity/AsyncResult"
import { useAtomSuspense } from "@effect/atom-react"
import { CorehallaClient } from "./client"
import type {
    Ladder,
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsRegion,
    RankedRegion,
    SortableLegendProp,
    SortablePlayerProp,
    SortableWeaponProp,
    CmsMediaSlot,
} from "@crh/api-contract/schemas"
import type { Weapon as WeaponName } from "@crh/bhapi/constants"

const ttl = "15 minutes"

/** Search results are ephemeral — a short TTL so a transient empty does not stick. */
const searchTtl = "1 minute"

type Region = typeof RankedRegion.Type
type LadderType = typeof Ladder.Type
type PowerMode = typeof PowerRankingsGameMode.Type
type PowerRegion = typeof PowerRankingsRegion.Type
type PowerOrder = typeof PowerRankingsOrderBy.Type
type SortableProp = typeof SortablePlayerProp.Type
type LegendProp = typeof SortableLegendProp.Type
type WeaponProp = typeof SortableWeaponProp.Type

// serializationKey is required for SSR dehydration; timeToLive covers loader dehydrate.
export const rankings1v1Atom = (region: Region, page: number, name?: string) =>
    CorehallaClient.query("rankings", "getRanked1v1", {
        query: name ? { region, page, name } : { region, page },
        serializationKey: `1v1:${region}:${page}:${name ?? ""}`,
        timeToLive: ttl,
    })

export const rankings2v2Atom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "getRanked2v2", {
        query: { region, page },
        serializationKey: `2v2:${region}:${page}`,
        timeToLive: ttl,
    })

export const rankings3v3Atom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "getRanked3v3", {
        query: { region, page },
        serializationKey: `3v3:${region}:${page}`,
        timeToLive: ttl,
    })

export const careerRankingsAtom = (sortBy: SortableProp, page: number) =>
    CorehallaClient.query("rankings", "getGlobalPlayerRankings", {
        query: { sortBy, page },
        serializationKey: `career:${sortBy}:${page}`,
        timeToLive: ttl,
    })

export const careerLegendRankingsAtom = (
    legendId: number,
    sortBy: LegendProp,
    page: number,
) =>
    CorehallaClient.query("rankings", "getGlobalLegendRankings", {
        query: { legendId, sortBy, page },
        serializationKey: `career-legend:${legendId}:${sortBy}:${page}`,
        timeToLive: ttl,
    })

export const careerWeaponRankingsAtom = (
    weapon: WeaponName,
    sortBy: WeaponProp,
    page: number,
) =>
    CorehallaClient.query("rankings", "getGlobalWeaponRankings", {
        query: { weapon, sortBy, page },
        serializationKey: `career-weapon:${weapon}:${sortBy}:${page}`,
        timeToLive: ttl,
    })

export const rankedQueueAtom = (bracket: LadderType, region: Region) =>
    CorehallaClient.query("rankings", "getRankedQueue", {
        query: { bracket, region },
        serializationKey: `queue:${bracket}:${region}`,
        timeToLive: ttl,
    })

export const clansRankingsAtom = (name: string, page: number) =>
    CorehallaClient.query("rankings", "getClansRankings", {
        query: { name, page },
        serializationKey: `clans:${name}:${page}`,
        timeToLive: ttl,
    })

export const powerRankingsAtom = (
    gameMode: PowerMode,
    region: PowerRegion,
    page: number,
    orderBy: PowerOrder,
) =>
    CorehallaClient.query("rankings", "getPowerRankings", {
        query: { gameMode, region, page, orderBy },
        serializationKey: `power:${gameMode}:${region}:${page}:${orderBy}`,
        timeToLive: ttl,
    })

export const playerProfileAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayer", {
        params: { playerId },
        serializationKey: `player:${playerId}:profile`,
        timeToLive: ttl,
    })

export const playerEsportsAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerEsports", {
        params: { playerId },
        serializationKey: `player:${playerId}:esports`,
        timeToLive: ttl,
    })

export const guildAtom = (guildId: number) =>
    CorehallaClient.query("guilds", "getGuild", {
        params: { guildId },
        serializationKey: `guild:${guildId}:profile`,
        timeToLive: ttl,
    })

export const lookupAtom = (q: string, region: Region, limit?: number) =>
    CorehallaClient.query("search", "lookup", {
        query: { q, region, ...(limit === undefined ? {} : { limit }) },
        serializationKey: `lookup:${q}:${region}:${limit ?? ""}`,
        timeToLive: searchTtl,
    })

/** The secondary scan: archived/alias-only players, ranked separately. */
export const aliasSearchAtom = (q: string) =>
    CorehallaClient.query("search", "searchPlayerAlias", {
        query: { alias: q, page: 1 },
        serializationKey: `alias:${q}`,
        timeToLive: searchTtl,
    })

export const newsArticlesAtom = (
    category: string,
    page: number,
    pageSize: number,
) =>
    CorehallaClient.query("content", "getBHArticles", {
        query: { category, page, pageSize },
        serializationKey: `news:${category}:${page}:${pageSize}`,
        timeToLive: ttl,
    })

export const newsArticleAtom = (slug: string) =>
    CorehallaClient.query("content", "getBHArticle", {
        params: { slug },
        serializationKey: `news:article:${slug}`,
        timeToLive: ttl,
    })

/** CMS slots change rarely; a long TTL keeps them off the API hot path. */
const cmsTtl = "1 hour"

export const cmsMediaManifestAtom = () =>
    CorehallaClient.query("cms", "getMediaManifest", {
        serializationKey: "cms:media",
        timeToLive: cmsTtl,
    })

export const mediaSlotsAtom: Atom.Atom<ReadonlyMap<string, CmsMediaSlot>> =
    Atom.make((get) => {
        const manifest = Option.getOrUndefined(
            AsyncResult.value(get(cmsMediaManifestAtom())),
        )

        return new Map((manifest?.slots ?? []).map((slot) => [slot.key, slot]))
    })

export const cmsArticlesAtom = (page: number, pageSize: number) =>
    CorehallaClient.query("cms", "getCmsArticles", {
        query: { page, pageSize },
        serializationKey: `cms:articles:${page}:${pageSize}`,
        timeToLive: cmsTtl,
    })

export const cmsArticleAtom = (slug: string) =>
    CorehallaClient.query("cms", "getCmsArticle", {
        params: { slug },
        serializationKey: `cms:article:${slug}`,
        timeToLive: cmsTtl,
    })

export type Registry = AtomRegistry.AtomRegistry

export type RouterContext = {
    readonly registry: Registry
}

export const makeRegistry = (): Registry => AtomRegistry.make()

export const preloadAtom = (
    registry: Registry,
    atom: Atom.Atom<any>,
): Promise<unknown> =>
    Effect.runPromise(
        AtomRegistry.getResult(registry, atom, { suspendOnWaiting: true }),
    )

export const dehydrateRegistry = (registry: Registry) =>
    Hydration.dehydrate(registry)

export type DehydratedState = ReturnType<typeof dehydrateRegistry>

/** Await so the router stays `pending` and can show the page loader. */
export const preloadAtoms = (
    context: RouterContext,
    atoms: ReadonlyArray<Atom.Atom<any>>,
): Promise<{ dehydrated: DehydratedState }> => {
    const pending = Promise.all(
        atoms.map((atom) => preloadAtom(context.registry, atom)),
    )

    // Only the render has state to hand over; the browser just waits.
    return import.meta.env.SSR
        ? pending.then(() => ({
              dehydrated: dehydrateRegistry(context.registry),
          }))
        : pending.then(() => ({ dehydrated: [] }))
}

export const useQuery = <A, E>(
    atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A => useAtomSuspense(atom).value
