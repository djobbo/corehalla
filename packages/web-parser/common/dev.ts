import { getBrawlhallaArticle, getBrawlhallaArticles } from "./index"
import { legends } from "bhapi/legends"
import { load } from "cheerio"
import { logInfo } from "logger"
import type { BrawlhallaArticle } from "./index"
import type { Legend } from "bhapi/types"

const findWeeklyRotation = ({ content }: BrawlhallaArticle) => {
    const $ = load(content)

    const legendRotationSubtitle = $("p")
        .filter((_, el) =>
            $(el).text().includes("free-to-play Legend rotation"),
        )
        .first()

    if (!legendRotationSubtitle) {
        logInfo("No legend rotation subtitle found")
        return []
    }

    const rawLegendsNames = legendRotationSubtitle
        .next("ul")
        .find("li")
        .map((_, el) => $(el).text())
        .get()
        .map((s) => s.slice(0, s.indexOf(" – ")).trim())

    const legendsNames = rawLegendsNames.filter((name) =>
        legends.find((l) => l.bio_name === name),
    ) as unknown as Legend[]

    logInfo("Found legends names", legendsNames)
    return legendsNames
}

const main = async () => {
    const [article] = await getBrawlhallaArticles({
        category: "weekly-rotation",
        first: 1,
    }).then(({ posts: { nodes: posts } }) => posts)

    if (!article) {
        logInfo("No article found")
        return
    }

    const post = await getBrawlhallaArticle(article.slug)
    findWeeklyRotation(post)
}

main()
