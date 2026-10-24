import { Cause, Effect, Option } from "effect"
import { Atom, AtomRegistry, Hydration } from "effect/reactivity"
import * as AsyncResult from "effect/reactivity/AsyncResult"
import { useAtomSuspense } from "@effect/atom-react"
import { directPlayerEsports } from "@crh/domain/direct/esports"
import { directGuild } from "@crh/domain/direct/guild"
import {
    directPlayerClan,
    directPlayerLegends,
    directPlayerProfile,
    directPlayerTeams,
    directPlayerWeapons,
} from "@crh/domain/direct/player"
import { directPowerRankings } from "@crh/domain/direct/power"
import {
    directRankings1v1,
    directRankings2v2,
    directRankings3v3,
} from "@crh/domain/direct/rankings"
import { CorehallaClient } from "./client"
import { isContractCompatible } from "./contract"
import { runFallback } from "./fallback"
import type { FallbackSection } from "./fallback"
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
    GuildEnvelope,
    PlayerClanEnvelope,
    PlayerEsportsEnvelope,
    PlayerLegendsEnvelope,
    PlayerProfileEnvelope,
    PlayerTeamsEnvelope,
    PlayerWeaponsEnvelope,
    PowerRankingsEnvelope,
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
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
export const rankings1v1QueryAtom = (
    region: Region,
    page: number,
    name?: string,
) =>
    CorehallaClient.query("rankings", "getRanked1v1", {
        query: name ? { region, page, name } : { region, page },
        serializationKey: `1v1:${region}:${page}:${name ?? ""}`,
        timeToLive: ttl,
    })

export const rankings1v1Atom = (region: Region, page: number, name?: string) =>
    sectionAtom<Rankings1v1Envelope>(
        rankings1v1QueryAtom(region, page, name),
        "rankings1v1",
        () =>
            runFallback("rankings1v1", (clients) =>
                directRankings1v1(clients.v1, region, page, name),
            ),
    )

export const rankings2v2QueryAtom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "getRanked2v2", {
        query: { region, page },
        serializationKey: `2v2:${region}:${page}`,
        timeToLive: ttl,
    })

export const rankings2v2Atom = (region: Region, page: number) =>
    sectionAtom<Rankings2v2Envelope>(
        rankings2v2QueryAtom(region, page),
        "rankings2v2",
        () =>
            runFallback("rankings2v2", (clients) =>
                directRankings2v2(clients.v1, region, page),
            ),
    )

export const rankings3v3QueryAtom = (region: Region, page: number) =>
    CorehallaClient.query("rankings", "getRanked3v3", {
        query: { region, page },
        serializationKey: `3v3:${region}:${page}`,
        timeToLive: ttl,
    })

export const rankings3v3Atom = (region: Region, page: number) =>
    sectionAtom<Rankings3v3Envelope>(
        rankings3v3QueryAtom(region, page),
        "rankings3v3",
        () =>
            runFallback("rankings3v3", (clients) =>
                directRankings3v3(clients.v1, region, page),
            ),
    )

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

export const powerRankingsQueryAtom = (
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

export const powerRankingsAtom = (
    gameMode: PowerMode,
    region: PowerRegion,
    page: number,
    orderBy: PowerOrder,
) =>
    sectionAtom<PowerRankingsEnvelope>(
        powerRankingsQueryAtom(gameMode, region, page, orderBy),
        "power",
        () =>
            runFallback("power", (clients) =>
                directPowerRankings(clients.brawltools, {
                    gameMode,
                    region,
                    page,
                    orderBy,
                }),
            ),
    )

type SectionEnvelope = {
    readonly meta: {
        readonly updated_at: number
        readonly complete?: boolean
    }
}

const isNotFound = (cause: Cause.Cause<unknown>): boolean =>
    Option.match(Cause.findErrorOption(cause), {
        onNone: () => false,
        onSome: (error) => (error as { _tag?: string })._tag === "NotFound",
    })

/**
 * Reads the API section; when it is incomplete or unreachable, rebuilds the
 * same section from v1 in the browser. The server atom keeps its hydration and
 * TTL on the happy path — this wrapper is only the patch layer.
 */
const sectionAtom = <A extends SectionEnvelope>(
    server: Atom.Atom<AsyncResult.AsyncResult<A, unknown>>,
    section: FallbackSection,
    run: () => Effect.Effect<A, unknown>,
    merge?: (server: A, direct: A) => A,
): Atom.Atom<AsyncResult.AsyncResult<A, unknown>> =>
    Atom.make((get) => {
        const result = get(server)

        if (AsyncResult.isInitial(result) || AsyncResult.isWaiting(result)) {
            return result
        }

        if (AsyncResult.isSuccess(result)) {
            if (
                result.value.meta.complete !== false &&
                isContractCompatible()
            ) {
                return result
            }

            if (import.meta.env.SSR) return result

            // A failed patch must not throw away the partial payload the
            // worker already managed to render.
            return run().pipe(
                Effect.map((value) =>
                    merge === undefined ? value : merge(result.value, value),
                ),
                Effect.catch(() => Effect.succeed(result.value)),
            )
        }

        if (isNotFound(result.cause)) return result

        // The route loader catches this and renders a client-only subtree, so
        // hydration reruns the plan in the browser.
        if (import.meta.env.SSR) return result

        const previous = Option.getOrUndefined(result.previousSuccess)

        return run().pipe(
            Effect.map((value) =>
                previous === undefined || merge === undefined
                    ? value
                    : merge(previous.value, value),
            ),
            Effect.catch((error) =>
                previous === undefined
                    ? Effect.fail(error)
                    : Effect.succeed(previous.value),
            ),
        )
    }) as unknown as Atom.Atom<AsyncResult.AsyncResult<A, unknown>>

export const playerProfileQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayer", {
        params: { playerId },
        serializationKey: `player:${playerId}:profile`,
        timeToLive: ttl,
    })

export const playerProfileAtom = (playerId: number) =>
    sectionAtom<PlayerProfileEnvelope>(
        playerProfileQueryAtom(playerId),
        "profile",
        () =>
            runFallback("profile", (clients) =>
                directPlayerProfile(clients.v1, playerId),
            ),
        // Aliases are archive-only; keep the ones the worker already served
        // when the browser rebuilds the rest of the profile.
        (server, direct) => ({
            ...direct,
            data: { ...direct.data, aliases: server.data.aliases },
        }),
    )

export const playerLegendsQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerLegends", {
        params: { playerId },
        serializationKey: `player:${playerId}:legends`,
        timeToLive: ttl,
    })

export const playerLegendsAtom = (playerId: number) =>
    sectionAtom<PlayerLegendsEnvelope>(
        playerLegendsQueryAtom(playerId),
        "legends",
        () =>
            runFallback("legends", (clients) =>
                directPlayerLegends(clients.v1, playerId),
            ),
    )

export const playerWeaponsQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerWeapons", {
        params: { playerId },
        serializationKey: `player:${playerId}:weapons`,
        timeToLive: ttl,
    })

export const playerWeaponsAtom = (playerId: number) =>
    sectionAtom<PlayerWeaponsEnvelope>(
        playerWeaponsQueryAtom(playerId),
        "weapons",
        () =>
            runFallback("weapons", (clients) =>
                directPlayerWeapons(clients.v1, playerId),
            ),
    )

export const playerTeamsQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerTeams", {
        params: { playerId },
        serializationKey: `player:${playerId}:teams`,
        timeToLive: ttl,
    })

export const playerTeamsAtom = (playerId: number) =>
    sectionAtom<PlayerTeamsEnvelope>(
        playerTeamsQueryAtom(playerId),
        "teams",
        () =>
            runFallback("teams", (clients) =>
                directPlayerTeams(clients.v1, playerId),
            ),
    )

export const playerClanQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerClan", {
        params: { playerId },
        serializationKey: `player:${playerId}:clan`,
        timeToLive: ttl,
    })

export const playerClanAtom = (playerId: number) =>
    sectionAtom<PlayerClanEnvelope>(playerClanQueryAtom(playerId), "clan", () =>
        runFallback("clan", (clients) =>
            directPlayerClan(clients.v1, playerId),
        ),
    )

export const playerEsportsQueryAtom = (playerId: number) =>
    CorehallaClient.query("players", "getPlayerEsports", {
        params: { playerId },
        serializationKey: `player:${playerId}:esports`,
        timeToLive: ttl,
    })

export const playerEsportsAtom = (playerId: number) =>
    sectionAtom<PlayerEsportsEnvelope>(
        playerEsportsQueryAtom(playerId),
        "esports",
        () =>
            runFallback("esports", (clients) =>
                directPlayerEsports(clients.brawltools, playerId),
            ),
    )

export const guildQueryAtom = (guildId: number) =>
    CorehallaClient.query("guilds", "getGuild", {
        params: { guildId },
        serializationKey: `guild:${guildId}:profile`,
        timeToLive: ttl,
    })

export const guildAtom = (guildId: number) =>
    sectionAtom<GuildEnvelope>(guildQueryAtom(guildId), "guild", () =>
        runFallback("guild", (clients) => directGuild(clients.v1, guildId)),
    )

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

/**
 * Preload that never fails the route. A failed section streams the shell and
 * lets hydration rerun the plan in the browser.
 */
export const preloadAtomsDegraded = async (
    context: RouterContext,
    atoms: ReadonlyArray<Atom.Atom<any>>,
): Promise<{ dehydrated: DehydratedState; degraded: boolean }> => {
    try {
        const result = await preloadAtoms(context, atoms)
        return { ...result, degraded: false }
    } catch {
        return { dehydrated: [], degraded: true }
    }
}

export const useQuery = <A, E>(
    atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A => useAtomSuspense(atom).value
