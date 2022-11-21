import { trpc } from "@util/trpc"
import type { BHArticleType } from "web-parser/bh-articles/parseBHArticlesPage"

export const useBrawlhallaArticles = (
    page = "1",
    type?: BHArticleType,
    max?: number,
) => {
    const { data, ...query } = trpc.getBHArticles.useQuery(
        {
            page,
            type,
            max,
        },
        {
            trpc: {
                ssr: false,
            },
        },
    )

    return {
        articles: data ?? [],
        ...query,
    }
}
