import type { APIRoute } from "astro"
import { Effect } from "effect"
import { getEmDashEntry } from "emdash"
import { articleOf, json } from "../../../../lib/public-api"

export const prerender = false

const notFound = json({ error: "Not found" }, 404)

const load = Effect.fn("cms.article.GET")(
    function* (slug: string) {
        const { entry, error } = yield* Effect.tryPromise({
            try: () => getEmDashEntry("posts", slug),
            catch: (cause) => new Error(String(cause)),
        })

        if (error) return json({ error: "Unable to load article" }, 500)
        if (!entry) return notFound

        const article = articleOf(entry)

        return article === null ? notFound : json(article)
    },
    Effect.orElseSucceed(() => json({ error: "Unable to load article" }, 500)),
)

export const GET: APIRoute = ({ params }) => {
    const slug = params.slug

    return typeof slug === "string" && slug.length > 0
        ? Effect.runPromise(load(slug))
        : Promise.resolve(notFound)
}
