import { legends } from "@crh/bhapi/legends"
import { load as loadHtml } from "cheerio"
import { logError, logInfo } from "@crh/logger"
import axios from "axios"
import { sanitizeArticleHtml } from "./sanitizeArticleHtml"

export { sanitizeArticleHtml } from "./sanitizeArticleHtml"

const BRAWLHALLA_GRAPHQL_API_URL = "https://cms.brawlhalla.com/graphql"

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

/** WP excerpts arrive as HTML with entities; previews and meta tags want text. */
const plainText = (html: string): string =>
    loadHtml(html).text().replace(/\s+/g, " ").trim()

/**
 * Cursor-paginated WordPress GraphQL reader for Brawlhalla's news.
 *
 * The connection has no `offset`, so a numbered page is expressed as
 * `first: page * pageSize` and sliced by the caller.
 */
export type BrawlhallaArticleVariables = {
    first: number | null
    category: string | null
    /** `pageInfo.endCursor` of the previous page; opaque. */
    after: string | null
}

export type BHArticleImage = {
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

export type BHArticleCategory = {
    name: string
    slug: string
}

export type BHArticle = {
    title: string
    slug: string
    dateGmt: string
    excerpt: string
    categories: BHArticleCategory[]
    featuredImage: BHArticleImage
}

export type BHArticleDetail = BHArticle & {
    content: string
}

export type BHArticlesPage = {
    articles: BHArticle[]
    endCursor: string | null
    hasNextPage: boolean
}

type RawArticleNode = {
    title: string
    slug: string
    dateGmt: string
    excerpt: string
    content?: string | null
    categories: {
        nodes: BHArticleCategory[]
    }
    featuredImage: {
        node: BHArticleImage
    }
}

const mapArticleNode = (node: RawArticleNode): BHArticle => ({
    title: node.title,
    slug: node.slug,
    dateGmt: node.dateGmt,
    excerpt: plainText(node.excerpt),
    categories: node.categories.nodes.map(({ name, slug }) => ({ name, slug })),
    featuredImage: {
        sourceUrl: node.featuredImage.node.sourceUrl,
        mediaDetails: {
            height: node.featuredImage.node.mediaDetails.height,
            width: node.featuredImage.node.mediaDetails.width,
            // WP serialises the size dimensions as strings.
            sizes: node.featuredImage.node.mediaDetails.sizes.map((size) => ({
                ...size,
                width: Number(size.width),
                height: Number(size.height),
            })),
        },
    },
})

const ARTICLE_FIELDS = `
    title
    slug
    dateGmt
    excerpt
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
`

export const getBrawlhallaArticles = async (
    variables?: Partial<BrawlhallaArticleVariables>,
): Promise<BHArticlesPage> => {
    const query = `
        query ($category: String, $after: String, $first: Int = 6) {
            posts(first: $first, after: $after, where: {categoryName: $category}) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    ${ARTICLE_FIELDS}
                }
            }
        }`

    const { data } = await getBrawlhallaGraphQLAPI<{
        data: {
            posts: {
                nodes: RawArticleNode[]
                pageInfo: {
                    hasNextPage: boolean
                    endCursor: string | null
                }
            }
        }
    }>(query, {
        first: variables?.first ?? 6,
        category: variables?.category ?? null,
        after: variables?.after ?? null,
    })

    return {
        articles: data.posts.nodes.map(mapArticleNode),
        endCursor: data.posts.pageInfo.endCursor,
        hasNextPage: data.posts.pageInfo.hasNextPage,
    }
}

export const getBrawlhallaArticle = async (
    slug: string,
): Promise<BHArticleDetail | null> => {
    const query = `
        query ($slug: ID!) {
            post(id: $slug, idType: SLUG) {
                ${ARTICLE_FIELDS}
                content
            }
        }`

    const { data } = await getBrawlhallaGraphQLAPI<{
        data: {
            post: (RawArticleNode & { content: string | null }) | null
        }
    }>(query, { slug })

    if (!data.post) return null

    return {
        ...mapArticleNode(data.post),
        content: sanitizeArticleHtml(data.post.content ?? ""),
    }
}

export const getWeeklyRotation = async () => {
    const page = await getBrawlhallaArticles({
        category: "weekly-rotation",
        first: 1,
    })

    const [latestWeeklyRotationArticle] = page.articles

    if (!latestWeeklyRotationArticle) {
        return []
    }

    const article = await getBrawlhallaArticle(latestWeeklyRotationArticle.slug)

    if (!article?.content) return []

    const $ = loadHtml(article.content)

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
