import { Context, Effect, Layer } from "effect"

/**
 * Bookkeeping work that must outlive the response that triggered it.
 *
 * A profile view writes what it read back to the archive, and none of that may
 * delay the response. `Effect.forkDetach` was half the answer: it forks the work
 * so the handler returns without awaiting it. The missing half is platform-
 * specific — on Cloudflare, once the `fetch` handler returns, the runtime is
 * free to tear the request down and any I/O still in flight is cancelled. A
 * detached fiber is invisible to the platform, so the write could simply never
 * happen: no error, no log, just a player who stays uncrawled.
 *
 * `ctx.waitUntil()` is what tells the runtime to keep the isolate alive. This
 * service is the seam between the two: handlers hand work to `run`, and the
 * worker entry hands `pendingWork()` to the platform. Nothing in `core` needs
 * to know it is running on Workers.
 *
 * ## Why the registry rather than a per-request context
 *
 * The obvious shape — a `Background` supplied per request through the router's
 * context parameter — does not survive this stack: `HttpRouter.toWebHandler`
 * only accepts a layer whose requirements are the router and its own request
 * types, so a service left unprovided there is rejected outright. Providing it
 * at build time and routing the promises through a registry costs one `Set` and
 * needs no changes to how the API is assembled.
 *
 * The registry is module scope, which is safe here for one reason: JavaScript
 * is single-threaded, so `Set` mutation cannot interleave. It is *not*
 * request-scoped, and that is deliberate — a request that finishes while an
 * unrelated write is still in flight will keep the isolate alive for that write
 * too. Over-approximating costs a few milliseconds of lifetime; under-
 * approximating loses the write, which is the bug being fixed.
 */
export type BackgroundShape = {
    /**
     * Hands the effect to the platform and returns immediately.
     *
     * Failure is a defect rather than a typed error: this is bookkeeping, the
     * caller has already answered the request, and there is nobody left to
     * handle it. It is dropped rather than logged because the runtime would
     * attribute the log to a request that has already ended — the write is
     * idempotent and the next view retries it.
     */
    readonly run: (
        effect: Effect.Effect<unknown, unknown>,
    ) => Effect.Effect<void>
}

export class Background extends Context.Service<Background, BackgroundShape>()(
    "app/Background",
) {}

/** Everything handed to `run` that has not settled yet. */
const inFlight = new Set<Promise<unknown>>()

const track = (effect: Effect.Effect<unknown, unknown>): void => {
    const promise = Effect.runPromise(effect.pipe(Effect.orDie))
        .catch(() => undefined)
        .finally(() => {
            inFlight.delete(promise)
        })

    inFlight.add(promise)
}

/**
 * A promise covering the work started so far.
 *
 * Called by the worker entry *after* the response exists and handed to
 * `ctx.waitUntil`, which is the only way to tell the runtime that there is
 * still something worth staying alive for.
 */
/*
 * `Promise.all` consumes the iterable immediately, so a write arriving while
 * this settles is covered by the *next* call rather than this one — which is
 * correct: `waitUntil` only needs to cover work this request started.
 */
export const pendingWork = (): Promise<unknown> => Promise.all(inFlight)

/** The production layer: work runs detached, and the entry keeps it alive. */
export const layer: Layer.Layer<Background> = Layer.succeed(Background, {
    run: (effect) => Effect.sync(() => track(effect)),
})

/**
 * Runs the work on the caller's own fiber, awaited.
 *
 * For tests and for the Node entry points (the crawler, the seed scripts) that
 * have no request lifetime to extend. Deliberately not the default: choosing it
 * in a Worker would reintroduce exactly the bug this service exists to fix, so
 * the worker entry has to reach for `layer` on purpose.
 */
export const inlineLayer: Layer.Layer<Background> = Layer.succeed(Background, {
    run: (effect) => effect.pipe(Effect.orDie, Effect.asVoid),
})
