import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/http"
import { withUserAgent } from "@crh/core/services/upstream/user-agent"
import {
    BrawltoolsError,
    BrawltoolsNotFound,
    make,
} from "@crh/domain/brawltools"
import type { BrawltoolsShape } from "@crh/domain/brawltools"

export { BrawltoolsError, BrawltoolsNotFound }

export type { BrawltoolsShape }

export class Brawltools extends Context.Service<Brawltools, BrawltoolsShape>()(
    "app/Brawltools",
) {}

export const layer = Layer.effect(
    Brawltools,
    Effect.gen(function* () {
        const client = withUserAgent(yield* HttpClient.HttpClient)

        return make(client)
    }),
)
