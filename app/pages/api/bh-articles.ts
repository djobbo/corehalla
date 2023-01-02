import { parseBHArticlesPage } from "@ch/web-parser/bh-articles/parseBHArticlesPage"
import type { BHArticleType } from "@ch/web-parser/bh-articles/parseBHArticlesPage"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    const { page = "1", type = "patch-notes", max } = req.query

    try {
        const pageNum = parseInt(page as string)
        const articles = await parseBHArticlesPage(
            pageNum,
            type.toString() as BHArticleType,
        )

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200",
        )

        if (max) {
            return res.json(articles.slice(0, parseInt(max.toString())))
        }
        res.json(articles)
    } catch {
        res.status(404).json({ error: "Page not found" })
    }
}

export default handler
