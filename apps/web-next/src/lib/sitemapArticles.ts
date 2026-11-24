import { Effect, Schema } from "effect"
import { apiBinding } from "../env"
import { articlePaths } from "./sitemap"

/** One upstream page of either article list; a shorter page is the last one. */
export const ARTICLE_PAGE_SIZE = 48

/** Page ceiling per list — eight each, so sixteen upstream calls at most. */
export const ARTICLE_PAGE_CAP = 8

const API_BASE_URL = "http://api.internal"
const NEWS_ARTICLES_PATH = "/api/v1/content/articles"
const UPDATES_ARTICLES_PATH = "/api/v1/cms/articles"

/** One page of an article list, as the paging loop consumes it. */
export type ArticleSource = (page: number) => Promise<unknown>

const ArticlePageSchema = Schema.Struct({
    articles: Schema.Array(Schema.Struct({ slug: Schema.String })),
})

const decodeArticlePage = Schema.decodeUnknownEffect(ArticlePageSchema)

const collectSlugs = (source: ArticleSource) =>
    Effect.gen(function* () {
        const slugs: string[] = []

        for (let page = 1; page <= ARTICLE_PAGE_CAP; page++) {
            const body = yield* Effect.promise(() => source(page))
            const decoded = yield* decodeArticlePage(body)
            const found = decoded.articles.map((article) => article.slug)

            slugs.push(...found)

            if (found.length < ARTICLE_PAGE_SIZE) break
        }

        return slugs
    })

const apiSource =
    (path: string): ArticleSource =>
    async (page) => {
        const api = await apiBinding()

        if (api === undefined) {
            throw new Error(`No \`API\` service binding for ${path}`)
        }

        const url = new URL(path, API_BASE_URL)
        url.searchParams.set("page", String(page))
        url.searchParams.set("pageSize", String(ARTICLE_PAGE_SIZE))

        const response = await api.fetch(new Request(url))

        if (!response.ok) {
            throw new Error(`${path} answered ${response.status}`)
        }

        return response.json()
    }

/**
 * Article paths for the sitemap, or `[]` when the binding is absent or a page
 * fails: a stale article list must not take the static sitemap down with it.
 */
export const fetchArticlePaths = async (
    news: ArticleSource = apiSource(NEWS_ARTICLES_PATH),
    updates: ArticleSource = apiSource(UPDATES_ARTICLES_PATH),
): Promise<readonly string[]> => {
    try {
        const [newsSlugs, updateSlugs] = await Promise.all([
            Effect.runPromise(collectSlugs(news)),
            Effect.runPromise(collectSlugs(updates)),
        ])

        return articlePaths(newsSlugs, updateSlugs)
    } catch (cause) {
        // eslint-disable-next-line no-console -- a dropped article list must be visible in worker logs
        console.error("[corehalla] sitemap article fetch failed", cause)

        return []
    }
}
