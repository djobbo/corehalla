import { useQuery } from "react-query"
import axios from "axios"
import type { BHArticle } from "web-parser/bh-articles/parseBHArticlesPage"

export const useBrawlhallaArticles = (
    page = 1,
    type = "patch-notes",
    max?: number,
) => {
    const { data: articles, ...query } = useQuery(
        ["bh-articles", page, type, max],
        async () => {
            const { data } = await axios.get<BHArticle[]>(`/api/bh-articles`, {
                params: {
                    page,
                    type,
                    max,
                },
            })

            if (!data) throw new Error("No data")

            return data
        },
    )

    return {
        articles: articles ?? [],
        ...query,
    }
}
