import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Content } from "../services/content"

/**
 * Scraped brawlhalla.com content.
 *
 * Nothing here is aggregated: the parsers already return the final shape the
 * pages render, and there is only one source per endpoint.
 */
export const contentGroup = HttpApiBuilder.group(
    CorehallaApi,
    "content",
    Effect.fnUntraced(function* (handlers) {
        const content = yield* Content

        return handlers
            .handle("getWeeklyRotation", () => content.getWeeklyRotation())
            .handle("getBHArticles", ({ query }) =>
                content.getArticles(query.category ?? "", query.first ?? 1),
            )
    }),
)
