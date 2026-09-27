import { Effect } from "effect"
import type { Atom } from "effect/unstable/reactivity"
import { AtomRegistry, Hydration } from "effect/unstable/reactivity"
import { useAtomSuspense } from "@effect/atom-react"
import { CorehallaClient } from "./client"
import type * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import type {
    Bracket,
    PowerRankingsRegion,
    RankedRegion,
    SortablePlayerProp,
} from "@crh/api-contract/schemas"

/**
 * Query atoms for the endpoints the study uses.
 *
 * Every surface reads through these, which is what makes hover-card prefetching
 * work: a card and the panel it opens read the *same* atom, so hovering warms
 * exactly what the click would otherwise wait for.
 *
 * `serializationKey` is required for an atom to participate in SSR dehydration,
 * and `timeToLive` keeps it alive long enough for a route loader to dehydrate.
 */

const ttl = "5 minutes"

type Region = typeof RankedRegion.Type
type BracketType = typeof Bracket.Type
type PowerRegion = typeof PowerRankingsRegion.Type
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

/** The 3v3 ladder. v1-only: the legacy API has no 3v3 mode. */
export const rankings3v3Atom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "get3v3Rankings", {
        query: { region, page },
        serializationKey: `3v3:${region}:${page}`,
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

/** The player's account stats. Prefetched by a hover card. */
export const playerStatsAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerStats", {
        params: { playerId },
        serializationKey: `player:${playerId}:stats`,
        timeToLive: ttl,
    })

/** The player's ranked records. Prefetched alongside the stats. */
export const playerRankedAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerRanked", {
        params: { playerId },
        serializationKey: `player:${playerId}:ranked`,
        timeToLive: ttl,
    })

/**
 * The player's 3v3 ranked record, or `null` when they have never queued it.
 *
 * Separate from `playerRankedAtom` because it is a separate endpoint — v0 has
 * no 3v3 mode, so unlike every other ranked record this one cannot ride along
 * with the 2v2 payload. Prefetched with the rest of the profile, so the
 * overview's ranked row never resolves in stages.
 */
export const player3v3RankedAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayer3v3Ranked", {
        params: { playerId },
        serializationKey: `player:${playerId}:ranked-3v3`,
        timeToLive: ttl,
    })

export const playerAliasesAtom = (playerId: number) =>
    CorehallaClient.query("stats", "getPlayerAliases", {
        params: { playerId },
        serializationKey: `player:${playerId}:aliases`,
        timeToLive: ttl,
    })

/** The clan. Prefetched by a hover card. */
export const clanStatsAtom = (clanId: number) =>
    CorehallaClient.query("stats", "getClanStats", {
        params: { clanId },
        serializationKey: `clan:${clanId}:stats`,
        timeToLive: ttl,
    })

/** The federated lookup: players and clans in one ranked list. */
export const lookupAtom = (q: string, limit?: number) =>
    CorehallaClient.query("search", "lookup", {
        query: limit === undefined ? { q } : { q, limit },
        serializationKey: `lookup:${q}:${limit ?? ""}`,
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
 * Resolves an atom on the server (or during a client navigation) so the matching
 * component renders a settled value on its first pass.
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
 * Preloads atoms in a route loader and returns dehydrated state so the server
 * HTML and the first client render agree.
 *
 * On the client the route commits immediately and the atoms stream in: a click
 * must never wait on a network round trip before the UI responds.
 */
export const preloadAtoms = (
    context: RouterContext,
    atoms: ReadonlyArray<Atom.Atom<any>>,
): { dehydrated: DehydratedState } | Promise<{ dehydrated: DehydratedState }> => {
    const pending = Promise.all(
        atoms.map((atom) => preloadAtom(context.registry, atom)),
    )

    if (!import.meta.env.SSR) {
        void pending
        return { dehydrated: [] }
    }

    return pending.then(() => ({
        dehydrated: dehydrateRegistry(context.registry),
    }))
}

/** Reads a query atom, suspending until it resolves. */
export const useQuery = <A, E>(
    atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A => useAtomSuspense(atom).value
