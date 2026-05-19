import { trpc } from "@util/trpc"
import type { BrawlhallaArticleCategory } from "web-parser/common"

export const useBrawlhallaArticles = (
    first?: number,
    category?: BrawlhallaArticleCategory,
) => {
    const { data, ...query } = trpc.getBHArticles.useQuery({
        category,
        first,
    })

    return {
        articles: data ?? [],
        ...query,
    }
}
