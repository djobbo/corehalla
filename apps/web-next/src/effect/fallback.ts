import { Data, Duration, Effect, Schedule } from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"
import { make as makeBrawltools } from "@crh/domain/brawltools"
import { makeUpstream } from "@crh/domain/upstream/client"
import type { BrawltoolsShape } from "@crh/domain/brawltools"
import type { V1UpstreamShape } from "@crh/domain/upstream/client"
import type { PlayerNotFound } from "@crh/domain/direct/player"
import type { SectionError } from "@crh/api-contract/schemas"
import { reportFallback } from "./telemetry"

const DIRECT_TIMEOUT_MS = 5_000
const BREAKER_THRESHOLD = 3
const BREAKER_WINDOW_MS = 60_000

export type FallbackSection =
    | "profile"
    | "legends"
    | "weapons"
    | "teams"
    | "clan"
    | "guild"
    | "rankings1v1"
    | "rankings2v2"
    | "rankings3v3"
    | "esports"
    | "power"

export type FallbackClients = {
    readonly v1: V1UpstreamShape
    readonly brawltools: BrawltoolsShape
}

const sourceOf = (section: FallbackSection): "v1" | "brawltools" =>
    section === "esports" || section === "power" ? "brawltools" : "v1"

export class FallbackDisabled extends Data.TaggedError(
    "FallbackDisabled",
)<{}> {}

export class FallbackOpen extends Data.TaggedError("FallbackOpen")<{}> {}

export class FallbackFailed extends Data.TaggedError("FallbackFailed")<{
    readonly section: FallbackSection
    readonly cause: unknown
}> {}

type Breaker = {
    failures: number
    lastFailure: number
    openUntil: number
}

const breakers = new Map<string, Breaker>()

const breaker = (key: string): Breaker => {
    const existing = breakers.get(key)

    if (existing) return existing

    const created: Breaker = { failures: 0, lastFailure: 0, openUntil: 0 }

    breakers.set(key, created)

    return created
}

const breakerOpen = (key: string, now: number): boolean =>
    breaker(key).openUntil > now

const recordFailure = (key: string, now: number): void => {
    const state = breaker(key)

    state.failures =
        now - state.lastFailure > BREAKER_WINDOW_MS ? 1 : state.failures + 1
    state.lastFailure = now

    if (state.failures >= BREAKER_THRESHOLD) {
        state.openUntil = now + BREAKER_WINDOW_MS
        state.failures = 0
    }
}

const recordSuccess = (key: string): void => {
    const state = breaker(key)

    state.failures = 0
    state.openUntil = 0
}

const env = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>
}

/**
 * Build-time kill switch, with a cached bootstrap override for shedding load
 * when the API is reachable but we do not want browser-direct traffic.
 */
export const fallbackEnabled = (): boolean => {
    if (import.meta.env.SSR) return false
    if (env.env?.VITE_ENABLE_UPSTREAM_FALLBACK === "false") return false

    try {
        return localStorage.getItem("corehalla:upstream-fallback") !== "off"
    } catch {
        return true
    }
}

const isRetryable = (error: SectionError | PlayerNotFound): boolean =>
    error._tag === "SectionFailed"

/**
 * Runs the same section plan the worker uses, from the browser. One retry with
 * jitter on upstream failure, a shared deadline, and a per-source circuit
 * breaker so an outage does not turn every visitor into a retry storm.
 */
export const runFallback = <A>(
    section: FallbackSection,
    build: (
        clients: FallbackClients,
    ) => Effect.Effect<A, SectionError | PlayerNotFound>,
): Effect.Effect<A, FallbackDisabled | FallbackOpen | FallbackFailed> =>
    Effect.gen(function* () {
        if (!fallbackEnabled()) {
            return yield* Effect.fail(new FallbackDisabled())
        }

        const source = sourceOf(section)
        const now = Date.now()

        if (breakerOpen(source, now)) {
            return yield* Effect.fail(new FallbackOpen())
        }

        const started = now
        const client = yield* HttpClient.HttpClient
        const clients: FallbackClients = {
            v1: makeUpstream(client, { retryNotFound: false }),
            brawltools: makeBrawltools(client),
        }

        const result = yield* build(clients).pipe(
            Effect.retry({
                schedule: Schedule.jittered(
                    Schedule.exponential(Duration.millis(250)),
                ),
                times: 1,
                while: isRetryable,
            }),
            Effect.timeout(Duration.millis(DIRECT_TIMEOUT_MS)),
            Effect.result,
        )

        if (result._tag === "Success") {
            recordSuccess(source)
            reportFallback({
                section,
                ok: true,
                duration_ms: Date.now() - started,
            })

            return result.success
        }

        recordFailure(source, Date.now())
        reportFallback({
            section,
            ok: false,
            duration_ms: Date.now() - started,
            reason: String(
                (result.failure as { _tag?: string })._tag ?? "unknown",
            ),
        })

        return yield* Effect.fail(
            new FallbackFailed({ section, cause: result.failure }),
        )
    }).pipe(Effect.provide(FetchHttpClient.layer))
