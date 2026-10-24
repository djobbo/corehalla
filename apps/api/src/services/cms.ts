import { Context, Effect, Layer, Schema } from "effect"
import { toStaticMediaUrl } from "@crh/common/helpers/media"
import { ContentError } from "@crh/core/errors"
import { cmsBinding, envValue } from "@crh/core/env"
import { NEWS_PAGE_SIZE } from "@crh/api-contract/schemas"
import type {
    CmsArticle,
    CmsArticlesPage,
    CmsImage,
    CmsMediaManifest,
} from "@crh/api-contract/schemas"

export class Cms extends Context.Service<
    Cms,
    {
        readonly getMediaManifest: () => Effect.Effect<CmsMediaManifest>
        readonly getArticles: (options: {
            readonly page?: number | undefined
            readonly pageSize?: number | undefined
            readonly category?: string | undefined
        }) => Effect.Effect<CmsArticlesPage>
        readonly getArticle: (slug: string) => Effect.Effect<CmsArticle | null>
    }
>()("app/Cms") {}

const CmsImageWire = Schema.Struct({
    url: Schema.String,
    alt: Schema.String,
    width: Schema.NullOr(Schema.Number),
    height: Schema.NullOr(Schema.Number),
    mimeType: Schema.NullOr(Schema.String),
})

const CmsArticleWire = Schema.Struct({
    id: Schema.String,
    slug: Schema.String,
    title: Schema.String,
    excerpt: Schema.String,
    heroImage: Schema.NullOr(CmsImageWire),
    content: Schema.Array(Schema.Unknown),
    publishedAt: Schema.String,
    featured: Schema.Boolean,
    category: Schema.NullOr(
        Schema.Struct({ name: Schema.String, slug: Schema.String }),
    ),
    author: Schema.Null,
    tags: Schema.Array(Schema.String),
})

const CmsMediaManifestWire = Schema.Struct({
    slots: Schema.Array(
        Schema.Struct({
            key: Schema.String,
            alt: Schema.String,
            image: Schema.NullOr(CmsImageWire),
        }),
    ),
})

const CmsArticlesPageWire = Schema.Struct({
    articles: Schema.Array(CmsArticleWire),
    page: Schema.Number,
    totalPages: Schema.Number,
    hasNextPage: Schema.Boolean,
})

const decodeBody = <A>(
    schema: Schema.ConstraintDecoder<A, never>,
    body: unknown,
): Effect.Effect<A, ContentError> =>
    Schema.decodeUnknownEffect(schema)(body).pipe(
        Effect.mapError((cause) => new ContentError({ cause })),
    )

const request = Effect.fn("Cms.request")(function* (path: string) {
    const cms = yield* Effect.tryPromise({
        try: cmsBinding,
        catch: (cause) => new ContentError({ cause }),
    })
    const cmsDevUrl = yield* Effect.promise(() => envValue("CMS_DEV_URL"))

    if (cms === undefined && cmsDevUrl === undefined) {
        return yield* new ContentError({
            cause: new Error(
                "No `CMS` binding or CMS_DEV_URL. Run through the Alchemy stack or start the local CMS.",
            ),
        })
    }

    const response =
        cms === undefined
            ? yield* Effect.tryPromise({
                  try: () =>
                      fetch(`${cmsDevUrl}${path}`, {
                          headers: { accept: "application/json" },
                      }),
                  catch: (cause) => new ContentError({ cause }),
              })
            : yield* Effect.tryPromise({
                  try: () =>
                      cms.fetch(
                          new Request(`https://cms.internal${path}`, {
                              headers: { accept: "application/json" },
                          }),
                      ),
                  catch: (cause) => new ContentError({ cause }),
              })

    if (!response.ok) {
        return yield* new ContentError({
            cause: new Error(
                `CMS request failed: ${response.status} ${response.statusText}`,
            ),
        })
    }

    return yield* Effect.tryPromise({
        try: () => response.json() as Promise<unknown>,
        catch: (cause) => new ContentError({ cause }),
    })
})

const imageOf = (image: typeof CmsImageWire.Type): CmsImage => ({
    ...image,
    url: toStaticMediaUrl(image.url),
})

const articleOf = (article: typeof CmsArticleWire.Type): CmsArticle => ({
    ...article,
    heroImage: article.heroImage === null ? null : imageOf(article.heroImage),
})

const manifest = Effect.fn("Cms.getMediaManifest")(function* () {
    const body = yield* request("/api/public/media")
    const decoded = yield* decodeBody(CmsMediaManifestWire, body)

    return {
        slots: decoded.slots.map((slot) => ({
            ...slot,
            image: slot.image === null ? null : imageOf(slot.image),
        })),
    }
})

const articles = Effect.fn("Cms.getArticles")(function* (options: {
    readonly page?: number | undefined
    readonly pageSize?: number | undefined
    readonly category?: string | undefined
}) {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? NEWS_PAGE_SIZE)
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    })
    const body = yield* request(`/api/public/articles?${params.toString()}`)
    const decoded = yield* decodeBody(CmsArticlesPageWire, body)

    return {
        articles: decoded.articles.map((article) => articleOf(article)),
        page: decoded.page,
        totalPages: decoded.totalPages,
        hasNextPage: decoded.hasNextPage,
    }
})

const article = Effect.fn("Cms.getArticle")(function* (slug: string) {
    const body = yield* request(
        `/api/public/articles/${encodeURIComponent(slug)}`,
    )
    const decoded = yield* decodeBody(CmsArticleWire, body)

    return articleOf(decoded)
})

export const layer = Layer.succeed(Cms, {
    getMediaManifest: () =>
        manifest().pipe(
            Effect.catchTag("ContentError", () =>
                Effect.succeed({ slots: [] }),
            ),
            Effect.orDie,
        ),
    getArticles: (options) =>
        articles(options).pipe(
            Effect.catchTag("ContentError", () =>
                Effect.succeed({
                    articles: [],
                    page: options.page ?? 1,
                    totalPages: 0,
                    hasNextPage: false,
                }),
            ),
            Effect.orDie,
        ),
    getArticle: (slug) =>
        article(slug).pipe(
            Effect.catchTag("ContentError", () => Effect.succeed(null)),
            Effect.orDie,
        ),
})
