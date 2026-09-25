import { Effect } from "effect"
import type { Atom } from "effect/unstable/reactivity"
import { AtomRegistry, Hydration } from "effect/unstable/reactivity"
import { useAtomSuspense } from "@effect/atom-react"
import { CorehallaClient } from "./Client"
import type * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import type {
    ArticleCategory,
    Bracket,
    PowerRankingsRegion,
    RankedRegion,
    SortablePlayerProp,
} from "./schemas"

/**
 * Query atoms for every `CorehallaApi` endpoint.
 *
 * `serializationKey` is required for a query atom to participate in SSR
 * dehydration, and `timeToLive` keeps the node alive long enough for the route
 * loader to dehydrate it.
 */

const ttl = "5 minutes"

type Region = typeof RankedRegion.Type
type BracketType = typeof Bracket.Type
type PowerRegion = typeof PowerRankingsRegion.Type
type ArticleCategoryType = typeof ArticleCategory.Type
type SortableProp = typeof SortablePlayerProp.Type

export const rankings1v1Atom = (region: Region, page: number, name?: string) =>
    CorehallaClient.query("rankings", "get1v1Rankings", {
        query: name ? { region, page, name } : { region, page },
        serializationKey: `1v1:${region}:${page}:${name ?? ""}`,
        timeToLive: ttl,
    })

export const rankings2v2Atom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "get2v2Rankings", {
        query: { region, page },
        serializationKey: `2v2:${region}:${page}`,
        timeToLive: ttl,
    })

export const globalRankingsAtom = (sortBy: SortableProp, page: number) =>
    CorehallaClient.query("rankings", "getGlobalPlayerRankings", {
        query: { sortBy, page },
        serializationKey: `global:${sortBy}:${page}`,
        timeToLive: ttl,
    })

export const clansRankingsAtom = (name: string, page: number) =>
    CorehallaClient.query("rankings", "getClansRankings", {
        query: { name, page },
        serializationKey: `clans:${name}:${page}`,
        timeToLive: ttl,
    })

export const powerRankingsAtom = (bracket: BracketType, region: PowerRegion) =>
    CorehallaClient.query("rankings", "getPowerRankings", {
        query: { bracket, region },
        serializationKey: `power:${bracket}:${region}`,
        timeToLive: ttl,
    })

export const playerStatsAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerStats", {
        params: { playerId },
        serializationKey: `player:${playerId}:stats`,
        timeToLive: ttl,
    })

export const playerRankedAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerRanked", {
        params: { playerId },
        serializationKey: `player:${playerId}:ranked`,
        timeToLive: ttl,
    })

export const playerAliasesAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerAliases", {
        params: { playerId },
        serializationKey: `player:${playerId}:aliases`,
        timeToLive: ttl,
    })

export const clanStatsAtom = (clanId: number) =>
    CorehallaClient.query("stats", "getClanStats", {
        params: { clanId },
        serializationKey: `clan:${clanId}:stats`,
        timeToLive: ttl,
    })

export const searchAliasAtom = (alias: string, page: number) =>
    CorehallaClient.query("search", "searchPlayerAlias", {
        query: { alias, page },
        serializationKey: `search:${alias}:${page}`,
        timeToLive: ttl,
    })

export const weeklyRotationAtom = () =>
    CorehallaClient.query("content", "getWeeklyRotation", {
        serializationKey: "content:weekly-rotation",
        timeToLive: ttl,
    })

export const articlesAtom = (category: ArticleCategoryType, first: number) =>
    CorehallaClient.query("content", "getBHArticles", {
        query: { category, first },
        serializationKey: `content:articles:${category}:${first}`,
        timeToLive: ttl,
    })

// --- SSR helpers -----------------------------------------------------------

export type Registry = AtomRegistry.AtomRegistry

/** Router context shared by every route loader. */
export type RouterContext = {
    readonly registry: Registry
}

export const makeRegistry = (): Registry => AtomRegistry.make()

/**
 * Resolves an atom on the server (or during a client navigation) so the
 * matching component can render a settled value on its first pass.
 */
export const preloadAtom = (
    registry: Registry,
    atom: Atom.Atom<any>,
): Promise<unknown> =>
    Effect.runPromise(
        AtomRegistry.getResult(registry, atom, { suspendOnWaiting: true }),
    )

/** Serializes the registry's settled, serializable atoms for hydration. */
export const dehydrateRegistry = (registry: Registry) =>
    Hydration.dehydrate(registry)

export type DehydratedState = ReturnType<typeof dehydrateRegistry>

/**
 * Preloads one or more atoms in a route loader and returns the dehydrated
 * registry state so the server HTML and the first client render agree.
 *
 * `Hydration.dehydrate` only runs on the server: on the client the atoms are
 * already live, so there is nothing to serialize.
 */
export const loadAtoms = async (
    context: RouterContext,
    atoms: ReadonlyArray<Atom.Atom<any>>,
): Promise<{ dehydrated: DehydratedState }> => {
    await Promise.all(atoms.map((atom) => preloadAtom(context.registry, atom)))

    return {
        dehydrated: import.meta.env.SSR
            ? dehydrateRegistry(context.registry)
            : [],
    }
}

/**
 * Reads a query atom and returns its success value, suspending until it
 * resolves and throwing failures into the nearest error boundary.
 */
export const useQuery = <A, E>(
    atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A => useAtomSuspense(atom).value
