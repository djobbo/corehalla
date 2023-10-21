import { Pagination } from "ui/base/Pagination"

type RankingsPaginationProps = {
    page: number
    baseHref: string
}

export const RankingsPagination = ({
    page,
    baseHref,
}: RankingsPaginationProps) => {
    return (
        <Pagination
            baseHref={baseHref}
            currentPage={page}
            firstPage={1}
            className="mt-4 justify-end"
        />
    )
}
