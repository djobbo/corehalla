import { legends } from "bhapi/legends"
import { load as loadHtml } from "cheerio"
import { logError, logInfo } from "logger"
import { z } from "zod"
import axios from "axios"

const BRAWLHALLA_GRAPHQL_API_URL = "https://cms.brawlhalla.com/graphql"
const BRAWLHALLA_WP_API_URL = "https://cms.brawlhalla.com/wp-json/wp/v2"

const BRAWLHALLA_GRAPHQL_API_HEADERS = {
    "Content-Type": "application/json",
}

const getBrawlhallaGraphQLAPI = async <T>(
    query: string,
    variables?: Record<string, unknown>,
): Promise<T> => {
    const { data } = await axios.post<T>(
        BRAWLHALLA_GRAPHQL_API_URL,
        {
            query,
            variables,
        },
        {
            headers: BRAWLHALLA_GRAPHQL_API_HEADERS,
        },
    )

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

    const { data } = await getBrawlhallaGraphQLAPI<{
        data: {
            posts: {
                nodes: {
                    title: string
                    slug: string
                    dateGmt: string
                    excerpt: string
                    categories: {
                        nodes: {
                            name: string
                            slug: string
                        }[]
                    }
                    featuredImage: {
                        node: {
                            sourceUrl: string
                            mediaDetails: {
                                height: number
                                width: number
                                sizes: {
                                    name: string
                                    mimeType: string
                                    sourceUrl: string
                                    width: number
                                    height: number
                                }[]
                            }
                        }
                    }
                }[]
                pageInfo: {
                    endCursor: string
                }
            }
        }
    }>(query, {
        ...defaultBrawlhallaArticleVariables,
        ...variables,
    })

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
    logInfo("getWeeklyRotation", `Found ${legendsListItems.length} list items`)

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

    const { data } = await axios.get<
        {
            id: number
            date: string
            date_gmt: string
            guid: {
                rendered: string
            }
            modified: string
            modified_gmt: string
            slug: string
            status: string
            type: string
            link: string
            title: {
                rendered: string
            }
            content: {
                rendered: string
                protected: boolean
            }
            yoast_head_json: {
                title: string
                canonical: string
                og_title: string
                og_description: string
                og_url: string
                og_site_name: string
                article_published_time: string
                article_modified_time: string
                og_image: {
                    width: number
                    height: number
                    url: string
                    type: string
                }[]
            }
            _embedded: {
                "wp:term": [
                    {
                        id: number
                        name: string
                        slug: string
                    }[],
                ]
            }
        }[]
    >(url)

    const [post] = data

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
