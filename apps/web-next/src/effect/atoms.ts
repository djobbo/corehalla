import { Effect } from "effect"
import type { Atom } from "effect/unstable/reactivity"
import { AtomRegistry, Hydration } from "effect/unstable/reactivity"
import { useAtomSuspense } from "@effect/atom-react"
import { CorehallaClient } from "./client"
import type * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import type {
    Bracket,
    Ladder,
    PowerRankingsRegion,
    RankedRegion,
    SortableLegendProp,
    SortablePlayerProp,
    SortableWeaponProp,
} from "@crh/api-contract/schemas"
import type { Weapon as WeaponName } from "@crh/bhapi/constants"

/**
 * Query atoms for the endpoints the study uses.
 *
 * Every surface reads through these, which is what makes hover-card prefetching
 * work: a card and the panel it opens read the *same* atom, so hovering warms
 * exactly what the click would otherwise wait for.
 *
 * ## One request per page
 *
 * The profile and guild pages read a single aggregate atom each. They used to
 * read three or four — career stats, v0 ranked, v1 3v3, the alias index — and
 * then roll the legends and weapons up in a `useMemo`. The server does that now;
 * see `apps/api/src/aggregate`. The tabs on a profile therefore share one
 * in-flight request, and opening a second tab costs nothing.
 *
 * `serializationKey` is required for an atom to participate in SSR dehydration,
 * and `timeToLive` keeps it alive long enough for a route loader to dehydrate it.
 */

const ttl = "5 minutes"

type Region = typeof RankedRegion.Type
type BracketType = typeof Bracket.Type
type LadderType = typeof Ladder.Type
type PowerRegion = typeof PowerRankingsRegion.Type
type SortableProp = typeof SortablePlayerProp.Type
type LegendProp = typeof SortableLegendProp.Type
type WeaponProp = typeof SortableWeaponProp.Type

/**
 * The live ladders, in the product row shape.
 *
 * `getRanked*` rather than the raw `upstream.get*Rankings`: the row arrives with
 * a slug and, for 2v2, both players as separate references. The raw surface
 * still exists under `/api/v1/upstream/brawlhalla` for parity checks.
 */
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

/** The 3v3 ladder. v1-only: the legacy API has no 3v3 mode. */
export const rankings3v3Atom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "getRanked3v3", {
        query: { region, page },
        serializationKey: `3v3:${region}:${page}`,
        timeToLive: ttl,
    })

/*
 * The three career boards.
 *
 * Named for what they rank rather than for the contract's `getGlobal*`
 * operations: those operation names and their `/rankings/global` path are
 * pinned by the deployed legacy app, which shares this contract. Only
 * web-next's own surface says "Career"; the wire keeps calling them global.
 */

export const careerRankingsAtom = (sortBy: SortableProp, page: number) =>
    CorehallaClient.query("rankings", "getGlobalPlayerRankings", {
        query: { sortBy, page },
        serializationKey: `career:${sortBy}:${page}`,
        timeToLive: ttl,
    })

/**
 * The same board restricted to one legend.
 *
 * A separate atom rather than a parameter on the one above, because it is a
 * separate request: the archive filters `BHPlayerLegend` by the legend and
 * sorts *that legend's* columns, so the two share a row shape and nothing else.
 */
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

/** The weapon board, read from the table the ingest materialises. */
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

/**
 * Who is playing right now, on one ladder.
 *
 * Not a paged ranking: the rows are the players whose game count rose since the
 * sampler last looked, so the list is short, self-expiring, and has no "next
 * page" — see `RANKED_QUEUE_WINDOW_MS` on the server.
 */
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

export const powerRankingsAtom = (bracket: BracketType, region: PowerRegion) =>
    CorehallaClient.query("rankings", "getPowerRankings", {
        query: { bracket, region },
        serializationKey: `power:${bracket}:${region}`,
        timeToLive: ttl,
    })

/**
 * The whole player profile, in one request.
 *
 * The header, every tab and the hover card all read this one atom, which is
 * what makes the hover cards and the profile agree by construction: there is no
 * second payload that could describe the player differently.
 */
export const playerProfileAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayer", {
        params: { playerId },
        serializationKey: `player:${playerId}:profile`,
        timeToLive: ttl,
    })

/** The whole guild page, in one request. Prefetched by a hover card. */
export const guildAtom = (guildId: number) =>
    CorehallaClient.query("guilds", "getGuild", {
        params: { guildId },
        serializationKey: `guild:${guildId}:profile`,
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
 * Both sides await, and that is what makes the page loader possible. A route
 * waiting on its data stays `pending` in the router, and pending is the one state
 * the router can substitute loading UI for. Resolving immediately on the client
 * and letting the component suspend instead is invisible to the router: React
 * keeps the previous page on screen for the whole wait, so there is nothing to
 * hang a loader on and a click appears to do nothing until the data lands.
 *
 * The trade is deliberate: a navigation now commits when its data does. Warm
 * navigations are unaffected — `defaultPreload: "intent"` means the atoms are
 * usually already settled, so the loader never appears at all.
 */
export const preloadAtoms = (
    context: RouterContext,
    atoms: ReadonlyArray<Atom.Atom<any>>,
): Promise<{ dehydrated: DehydratedState }> => {
    const pending = Promise.all(
        atoms.map((atom) => preloadAtom(context.registry, atom)),
    )

    // Only the render has state to hand over; the browser just has to wait.
    return import.meta.env.SSR
        ? pending.then(() => ({
              dehydrated: dehydrateRegistry(context.registry),
          }))
        : pending.then(() => ({ dehydrated: [] }))
}

/** Reads a query atom, suspending until it resolves. */
export const useQuery = <A, E>(
    atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A => useAtomSuspense(atom).value
