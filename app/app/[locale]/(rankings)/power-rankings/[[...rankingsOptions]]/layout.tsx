import { BracketSelection } from "../../BracketSelection"
import { Paginator } from "ui/base/Paginator"
import { type ReactNode } from "react"
import { powerRankedRegionSchema, powerRankedRegions } from "bhapi/constants"
import { z } from "zod"

type RankingsLayoutProps = {
    children: ReactNode
    params: {
        rankingsOptions?: string[]
    }
}

export default async function RankingsLayout({
    children,
    params: { rankingsOptions = [] },
}: RankingsLayoutProps) {
    const bracket = z
        .enum(["1v1", "2v2"])
        .catch("1v1")
        .parse(rankingsOptions[1])

    const region = powerRankedRegionSchema.parse(rankingsOptions[1])

    const regionPages = powerRankedRegions.map((region) => ({
        id: region,
        label: region,
        href: `/power-rankings/${bracket}/${region}`,
    }))

    return (
        <>
            <BracketSelection region={region} isPower>
                <Paginator
                    pages={regionPages}
                    currentPage={region}
                    responsive
                />
            </BracketSelection>
            {children}
        </>
    )
}
