import { Context, Effect, Layer } from "effect"

/**
 * Detached work must be registered for `ctx.waitUntil` or Workers cancels it
 * when the response returns. Nested `run` from background work stays inline so
 * the child stays inside the parent's waitUntil promise.
 *
 * Module-scope registry: `HttpRouter.toWebHandler` cannot take a per-request
 * Background layer. JS is single-threaded, so Set mutation is safe.
 */
export type BackgroundShape = {
    /** Failure becomes a defect — caller already answered; write is idempotent. */
    readonly run: (
        effect: Effect.Effect<unknown, unknown>,
    ) => Effect.Effect<void>
}

export class Background extends Context.Service<Background, BackgroundShape>()(
    "app/Background",
) {}

/** True when this fiber is already under a waitUntil promise. */
const InBackground = Context.Reference<boolean>("app/Background/InBackground", {
    defaultValue: () => false,
})

const inFlight = new Set<Promise<unknown>>()

const track = (effect: Effect.Effect<unknown, unknown>): void => {
    const promise = Effect.runPromise(
        effect.pipe(Effect.provideService(InBackground, true), Effect.orDie),
    )
        .catch(() => undefined)
        .finally(() => {
            inFlight.delete(promise)
        })

    inFlight.add(promise)
}

/** Hand to `ctx.waitUntil`. Work arriving mid-settle is covered by the next call. */
export const pendingWork = (): Promise<unknown> => Promise.all(inFlight)

/** Detach unless already in background — then run inline (see InBackground). */
export const layer: Layer.Layer<Background> = Layer.succeed(Background, {
    run: (effect) =>
        Effect.withFiber((fiber) =>
            fiber.getRef(InBackground)
                ? effect.pipe(Effect.orDie, Effect.asVoid)
                : Effect.sync(() => track(effect)),
        ),
})

/** Awaited on the caller fiber — tests and Node entries with no request lifetime. */
export const inlineLayer: Layer.Layer<Background> = Layer.succeed(Background, {
    run: (effect) => effect.pipe(Effect.orDie, Effect.asVoid),
})
