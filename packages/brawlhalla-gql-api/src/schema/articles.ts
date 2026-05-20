import { Schema } from "effect"

const Author = Schema.Struct({
    name: Schema.String,
})

const Category = Schema.Struct({
    name: Schema.String,
    slug: Schema.String,
})

const ImageSize = Schema.Struct({
    name: Schema.String,
    mimeType: Schema.String,
    sourceUrl: Schema.String,
    width: Schema.NumberFromString,
    height: Schema.NumberFromString,
})

const FeaturedImage = Schema.Struct({
    sourceUrl: Schema.String,
    mediaDetails: Schema.Struct({
        height: Schema.Number,
        width: Schema.Number,
        sizes: Schema.Array(ImageSize),
    }),
})

export const Article = Schema.Struct({
    title: Schema.String,
    slug: Schema.String,
    dateGmt: Schema.String,
    excerpt: Schema.String,
    content: Schema.optionalKey(Schema.String),
    author: Schema.Struct({
        node: Author,
    }),
    categories: Schema.Struct({
        nodes: Schema.Array(Category),
    }),
    featuredImage: Schema.Struct({
        node: FeaturedImage,
    }),
})

export const ArticlesResponse = Schema.Struct({
    data: Schema.Struct({
        posts: Schema.Struct({
            pageInfo: Schema.Struct({
                endCursor: Schema.NullOr(Schema.String),
            }),
            nodes: Schema.Array(Article),
        }),
    }),
})

export type Article = typeof Article.Type
export type ArticlesResponse = typeof ArticlesResponse.Type
