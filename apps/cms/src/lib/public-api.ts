import { Option, Schema } from "effect"

export const json = (data: unknown, status = 200): Response =>
    new Response(
        Schema.encodeSync(Schema.fromJsonString(Schema.Unknown))(data),
        {
            status,
            headers: {
                "content-type": "application/json; charset=utf-8",
                "cache-control":
                    "public, max-age=60, stale-while-revalidate=300",
            },
        },
    )

const EmDashImage = Schema.Struct({
    src: Schema.optionalKey(Schema.String),
    meta: Schema.optionalKey(
        Schema.Struct({
            storageKey: Schema.optionalKey(Schema.String),
        }),
    ),
    alt: Schema.optionalKey(Schema.String),
    width: Schema.optionalKey(Schema.Number),
    height: Schema.optionalKey(Schema.Number),
    mimeType: Schema.optionalKey(Schema.String),
})

const EmDashTerm = Schema.Struct({
    label: Schema.optionalKey(Schema.String),
    slug: Schema.String,
})

const EmDashTerms = Schema.Struct({
    category: Schema.optionalKey(Schema.Array(EmDashTerm)),
    tag: Schema.optionalKey(Schema.Array(EmDashTerm)),
})

const EmDashPostData = Schema.Struct({
    id: Schema.optionalKey(Schema.String),
    slug: Schema.optionalKey(Schema.String),
    title: Schema.optionalKey(Schema.String),
    excerpt: Schema.optionalKey(Schema.String),
    featured_image: Schema.optionalKey(Schema.NullOr(EmDashImage)),
    content: Schema.optionalKey(Schema.Array(Schema.Unknown)),
    publishedAt: Schema.optionalKey(
        Schema.NullOr(Schema.Union([Schema.Date, Schema.String])),
    ),
    terms: Schema.optionalKey(EmDashTerms),
})

export const PublicImageSchema = Schema.Struct({
    url: Schema.String,
    alt: Schema.String,
    width: Schema.NullOr(Schema.Number),
    height: Schema.NullOr(Schema.Number),
    mimeType: Schema.NullOr(Schema.String),
})

export type PublicImage = typeof PublicImageSchema.Type

export const PublicArticleSchema = Schema.Struct({
    id: Schema.String,
    slug: Schema.String,
    title: Schema.String,
    excerpt: Schema.String,
    heroImage: Schema.NullOr(PublicImageSchema),
    content: Schema.Array(Schema.Unknown),
    publishedAt: Schema.String,
    featured: Schema.Boolean,
    category: Schema.NullOr(
        Schema.Struct({ name: Schema.String, slug: Schema.String }),
    ),
    author: Schema.Null,
    tags: Schema.Array(Schema.String),
})

export type PublicArticle = typeof PublicArticleSchema.Type

export const PublicMediaManifestSchema = Schema.Struct({
    slots: Schema.Array(
        Schema.Struct({
            key: Schema.String,
            alt: Schema.String,
            image: Schema.NullOr(PublicImageSchema),
        }),
    ),
})

export const PublicArticlesPageSchema = Schema.Struct({
    articles: Schema.Array(PublicArticleSchema),
    page: Schema.Number,
    totalPages: Schema.Number,
    hasNextPage: Schema.Boolean,
})

export const imageOf = (value: unknown): PublicImage | null => {
    const image = Schema.decodeUnknownOption(EmDashImage)(value)
    if (Option.isNone(image)) return null

    const src = image.value.src ?? ""
    const storageKey = image.value.meta?.storageKey ?? ""
    const url =
        src.length > 0
            ? src
            : storageKey.length > 0
              ? `/_emdash/api/media/file/${storageKey}`
              : ""

    if (url.length === 0) return null

    return {
        url,
        alt: image.value.alt ?? "",
        width: image.value.width ?? null,
        height: image.value.height ?? null,
        mimeType: image.value.mimeType ?? null,
    }
}

const dateOf = (value: unknown): string => {
    const date = Schema.decodeUnknownOption(
        Schema.Union([Schema.Date, Schema.String]),
    )(value)

    return Option.match(date, {
        onNone: () => "",
        onSome: (value) =>
            value instanceof Date ? value.toISOString() : value,
    })
}

const termOf = (value: unknown): { name: string; slug: string } | null => {
    const term = Schema.decodeUnknownOption(EmDashTerm)(value)
    if (Option.isNone(term)) return null

    const name = term.value.label ?? term.value.slug
    if (name.length === 0) return null

    return { name, slug: term.value.slug }
}

export const articleOf = (entry: {
    readonly id: string
    readonly data: unknown
}): PublicArticle | null => {
    const decoded = Schema.decodeUnknownOption(EmDashPostData)(entry.data)
    if (Option.isNone(decoded)) return null

    const data = decoded.value
    const title = data.title ?? ""
    if (title.length === 0) return null

    const terms = data.terms
    const categories = terms?.category ?? []
    const tags = terms?.tag ?? []

    return {
        id: data.id ?? entry.id,
        slug: data.slug ?? entry.id,
        title,
        excerpt: data.excerpt ?? "",
        heroImage: imageOf(data.featured_image),
        content: data.content ?? [],
        publishedAt: dateOf(data.publishedAt),
        featured: false,
        category: termOf(categories[0]),
        author: null,
        tags: tags.flatMap((tag) => {
            const name = tag.label ?? tag.slug
            return name.length > 0 ? [name] : []
        }),
    }
}

const PageNumber = Schema.FiniteFromString

export const pageParam = (
    value: string | null,
    fallback: number,
    min: number,
    max: number,
): number => {
    const parsed = Schema.decodeUnknownOption(PageNumber)(value ?? "")
    if (Option.isNone(parsed)) return fallback

    return Math.min(Math.max(Math.trunc(parsed.value), min), max)
}
