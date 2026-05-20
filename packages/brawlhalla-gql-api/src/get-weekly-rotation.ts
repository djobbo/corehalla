import * as Effect from "effect/Effect"

import { BrawlhallaGqlApiClientService } from "./api/client.js"
import { parseWeeklyRotation } from "./helpers/parse-weekly-rotation.js"
import type { WeeklyRotation } from "./schema/weekly-rotation.js"

/** Fetches the latest weekly-rotation post and parses legend names from its HTML. */
export const getWeeklyRotation = Effect.fn("getWeeklyRotation")(function* () {
    const client = yield* BrawlhallaGqlApiClientService

    const articles = yield* client.articles.withContent({
        payload: {
            first: 1,
            category: "weekly-rotation",
        },
    })

    const content = articles.data.posts.nodes[0]?.content

    return yield* parseWeeklyRotation(content)
})

export type { WeeklyRotation }
