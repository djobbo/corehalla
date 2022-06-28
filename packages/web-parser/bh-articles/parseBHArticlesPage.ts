import { bhArticlesMock } from "./bhArticlesMock"
import { load } from "cheerio"
import axios from "axios"

const __DEV = process.env.NODE_ENV === "development"

const BH_ARTICLES_BASE_URL = "https://www.brawlhalla.com/news"

export type BHArticle = {
    id: string
    title: string
    href: string
    thumb: string
    tags: {
        label: string
        type: string
    }[]
    date: string
    content: string
}

export const parseBHArticlesPage = async (
    pageId: number,
    articleType = "patch-notes",
): Promise<BHArticle[]> => {
    if (__DEV) return bhArticlesMock

    const page = `${BH_ARTICLES_BASE_URL}/${articleType}/page/${pageId}`
    const { data } = await axios.get<string>(page)

    const $ = load(data)

    return $("article.post.has-post-thumbnail")
        .map((_, el) => {
            const $article = $(el)
            const $title = $article.find("h2.entry-title")
            const $link = $title.find("a")
            const $thumb = $article.find(".entry-featured-image-url img")
            const $tags = $article.find("p.post-meta a")
            const $date = $article.find("p.post-meta span.published")
            const $content = $article.find(".post-content-inner")

            return {
                id: $article.attr("id") ?? "",
                title: $title.text(),
                href: $link.attr("href") ?? "",
                thumb: $thumb.attr("src") ?? "",
                tags: $tags
                    .map((_, el) => {
                        const label = $(el).text()
                        return {
                            label,
                            type: label.replace(/\s/g, "-").toLowerCase(),
                        }
                    })
                    .get(),
                date: $date.text(),
                content: $content.text(),
            }
        })
        .get()
}
