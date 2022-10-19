import { legends } from "bhapi/legends"
import { load } from "cheerio"
import { parseBHArticlesPage } from "../bh-articles/parseBHArticlesPage"
import axios from "axios"
import type { Legend } from "bhapi/types"

const PREFIXES = [
    "The free-to-play Legend rotation for this week includes: ",
    "The free-to-play Legend rotation for this week features ",
]

export const getWeeklyRotation = async () => {
    const [article] = await parseBHArticlesPage(1, "weekly-rotation")

    if (!article) return []

    const { data } = await axios.get<string>(article.href)

    const $ = load(data)

    for (const prefix of PREFIXES) {
        const txt = $("i")
            .filter((_, el) => $(el).text().startsWith(prefix))
            .first()
            .text()

        if (!txt) continue

        const legendsNames = txt
            .slice(prefix.length)
            .replace(".", "")
            .replace(/&|(and)/g, "")
            .split(",")
            .map((s) => s.trim())

        return legendsNames
            .map((name) => legends.find((l) => l.bio_name === name))
            .filter(Boolean) as Legend[]
    }
}
