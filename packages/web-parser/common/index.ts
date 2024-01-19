import { legends } from "bhapi/legends"
import { load as loadHtml } from "cheerio"
import { logError } from "logger"
import { z } from "zod"

const BRAWLHALLA_GRAPHQL_API_URL = "https://cms.brawlhalla.com/graphql"
const BRAWLHALLA_WP_API_URL = "https://cms.brawlhalla.com/wp-json/wp/v2"

const BRAWLHALLA_GRAPHQL_API_HEADERS = {
    "Content-Type": "application/json",
}

const getBrawlhallaGraphQLAPI = async <T>(
    query: string,
    variables?: Record<string, unknown>,
    schema?: z.Schema<T>,
): Promise<T> => {
    const data = await fetch(BRAWLHALLA_GRAPHQL_API_URL, {
        method: "POST",
        headers: BRAWLHALLA_GRAPHQL_API_HEADERS,
        body: JSON.stringify({
            query,
            variables,
        }),
    })
        .then((res) => res.json())
        .then((res) => (schema ? schema.parse(res) : res))

    return data
}

export const brawlhallaArticleCategorySchema = z.union([
    z.literal(""),
    z.literal("weekly-rotation"),
    z.literal("patch-notes"),
])

export type BrawlhallaArticleCategory = z.infer<
    typeof brawlhallaArticleCategorySchema
>

export type BrawlhallaArticleVariables = {
    first: number | null
    category: BrawlhallaArticleCategory | null
    after: number | null
}

const defaultBrawlhallaArticleVariables: BrawlhallaArticleVariables = {
    first: 6,
    category: null,
    after: null,
}

export type BHArticle = Awaited<
    ReturnType<typeof getBrawlhallaArticles>
>[number]

export const getBrawlhallaArticles = async (
    variables?: Partial<BrawlhallaArticleVariables>,
) => {
    const query = `
        query ($category: String, $after: String, $first: Int = 6) {
            posts(first: $first, after: $after, where: {categoryName: $category}) {
                pageInfo {
                    endCursor
                }
                nodes {
                    title
                    slug
                    dateGmt
                    excerpt
                    author {
                        node {
                            databaseId
                            name
                        }
                    }
                    categories {
                        nodes {
                            name
                            slug
                        }
                    }
                    featuredImage {
                        node {
                            sourceUrl
                            mediaDetails {
                                height
                                width
                                sizes {
                                    name
                                    mimeType
                                    sourceUrl
                                    width
                                    height
                                }
                            }
                        }
                    }
                }
            }
        }`

    const { data } = await getBrawlhallaGraphQLAPI(
        query,
        {
            ...defaultBrawlhallaArticleVariables,
            ...variables,
        },
        z.object({
            data: z.object({
                posts: z.object({
                    nodes: z.array(
                        z.object({
                            title: z.string(),
                            slug: z.string(),
                            dateGmt: z.string(),
                            excerpt: z.string(),
                            categories: z.object({
                                nodes: z.array(
                                    z.object({
                                        name: z.string(),
                                        slug: z.string(),
                                    }),
                                ),
                            }),
                            featuredImage: z.object({
                                node: z.object({
                                    sourceUrl: z.string(),
                                    mediaDetails: z.object({
                                        sizes: z.array(
                                            z.object({
                                                name: z.string(),
                                                mimeType: z.string(),
                                                sourceUrl: z.string(),
                                            }),
                                        ),
                                    }),
                                }),
                            }),
                        }),
                    ),
                    pageInfo: z.object({
                        endCursor: z.string(),
                    }),
                }),
            }),
        }),
    )

    return data.posts.nodes.map((node) => ({
        title: node.title,
        slug: node.slug,
        dateGmt: node.dateGmt,
        excerpt: node.excerpt,
        categories: node.categories.nodes.map(({ name, slug }) => ({
            name,
            slug,
        })),
        featuredImage: node.featuredImage.node,
    }))
}

export const getWeeklyRotation = async () => {
    const latestWeeklyRotationArticle = await getBrawlhallaArticles({
        category: "weekly-rotation",
        first: 1,
    })

    if (latestWeeklyRotationArticle.length < 1) {
        return []
    }

    const { slug } = latestWeeklyRotationArticle[0]

    const { content } = await getBrawlhallaArticle(slug)

    if (!content) return []

    const $ = loadHtml(content)

    // Find list directly following the paragraph containing the required "free-to-play" phrase
    const legendsList = $("p + ul")
        .filter((index, element) => {
            const el = $(element)
            const paragraphText = el.prev("p").text().toLowerCase()
            return paragraphText.includes("free-to-play legend rotation")
        })
        .first()

    if (legendsList.length < 1) {
        logError("getWeeklyRotation", "Could not find legends list")
        return []
    }

    // Select all list items within the <ul> following the found paragraph
    const legendsListItems = legendsList.find("li")
    // Extract the legend names
    const weeklyRotation = legendsListItems
        .map((index, element) => {
            const text = $(element).text()
            const legendName = text.split(" – ")[0] // Extracts the name before the hyphen

            const legend = legends.find(
                (legend) => legend.bio_name === legendName,
            )

            return legend
        })
        .get()

    return weeklyRotation
}

const getBrawlhallaArticle = async (slug: string) => {
    const url = `${BRAWLHALLA_WP_API_URL}/posts?_embed&slug=${slug}`

    const post = await fetch(url)
        .then((res) => res.json())
        .then((res) =>
            z
                .array(
                    z.object({
                        id: z.number(),
                        date: z.string(),
                        date_gmt: z.string(),
                        guid: z.object({
                            rendered: z.string(),
                        }),
                        modified: z.string(),
                        modified_gmt: z.string(),
                        slug: z.string(),
                        status: z.string(),
                        type: z.string(),
                        link: z.string(),
                        title: z.object({
                            rendered: z.string(),
                        }),
                        content: z.object({
                            rendered: z.string(),
                            protected: z.boolean(),
                        }),
                        yoast_head_json: z.object({
                            title: z.string(),
                            canonical: z.string(),
                            og_title: z.string(),
                            og_description: z.string(),
                            og_url: z.string(),
                            og_site_name: z.string(),
                            article_published_time: z.string(),
                            article_modified_time: z.string(),
                            og_image: z.array(
                                z.object({
                                    width: z.number(),
                                    height: z.number(),
                                    url: z.string(),
                                    type: z.string(),
                                }),
                            ),
                        }),
                        _embedded: z.object({
                            "wp:term": z.array(
                                z.array(
                                    z.object({
                                        id: z.number(),
                                        name: z.string(),
                                        slug: z.string(),
                                    }),
                                ),
                            ),
                        }),
                    }),
                )
                .parse(res),
        )
        .then((res) => res[0])

    return {
        title: post.yoast_head_json.title,
        slug: post.slug,
        dateGmt: post.date_gmt,
        description: post.yoast_head_json.og_description,
        content: post.content.rendered,
        tags: post._embedded["wp:term"][0].map(({ name, slug }) => ({
            name,
            slug,
        })),
    }
}
