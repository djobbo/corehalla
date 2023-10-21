import { BracketSelection } from "../../BracketSelection"
import { Paginator } from "ui/base/Paginator"
import { type ReactNode } from "react"
import { rankedRegionSchema, rankedRegions } from "bhapi/constants"
import { z } from "zod"

type RankingsLayoutProps = {
    ranked1v1: ReactNode
    ranked2v2: ReactNode
    rotating: ReactNode
    params: {
        rankingsOptions?: string[]
    }
}

const getRankingsOptions = (rankingsOptions: string[]) => {
    const bracket = z
        .enum(["1v1", "2v2", "rotating"])
        .catch("1v1")
        .parse(rankingsOptions[0])

    const region = rankedRegionSchema.parse(rankingsOptions[1])

    return { bracket, region }
}

export default async function RankingsLayout({
    ranked1v1,
    ranked2v2,
    rotating,
    params: { rankingsOptions = [] },
}: RankingsLayoutProps) {
    const { bracket, region } = getRankingsOptions(rankingsOptions)

    const regionPages = rankedRegions.map((region) => ({
        id: region,
        label: region,
        href: `/ranked/${bracket}/${region}`,
    }))

    return (
        <>
            <BracketSelection region={region} isRanked>
                <Paginator
                    pages={regionPages}
                    currentPage={region}
                    responsive
                />
            </BracketSelection>
            {bracket === "1v1" && ranked1v1}
            {bracket === "2v2" && ranked2v2}
            {bracket === "rotating" && rotating}
        </>
    )
}
