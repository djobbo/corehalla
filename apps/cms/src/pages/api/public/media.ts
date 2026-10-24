import type { APIRoute } from "astro"
import { Effect } from "effect"
import { getEmDashCollection } from "emdash"
import { CmsUnavailable, imageOf, json } from "../../../lib/public-api"

export const prerender = false

const load = Effect.fn("cms.media.GET")(
    function* () {
        const { entries, error } = yield* Effect.tryPromise({
            try: () =>
                getEmDashCollection("media_slots", {
                    limit: 200,
                    orderBy: { key: "asc" },
                }),
            catch: (cause) => new CmsUnavailable({ cause }),
        })

        if (error) return json({ slots: [] }, 500)

        return json({
            slots: entries.flatMap((entry) => {
                const key = entry.data.key
                if (typeof key !== "string" || key.length === 0) return []

                const image = imageOf(entry.data.image)

                return [
                    {
                        key,
                        alt: entry.data.alt || image?.alt || "",
                        image,
                    },
                ]
            }),
        })
    },
    Effect.orElseSucceed(() => json({ slots: [] }, 500)),
)

export const GET: APIRoute = () => Effect.runPromise(load())
