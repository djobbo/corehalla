import { type Metadata } from "next"
import { Rankings2v2Table } from "./Rankings2v2Table"
import { RankingsPagination } from "@/app/(rankings)/RankingsPagination"
import { get2v2Rankings } from "bhapi"
import { rankedRegionSchema } from "bhapi/constants"
import { z } from "zod"

type Rankings2v2PageProps = {
    params: {
        rankingsOptions?: string[]
    }
}

const getRankingsOptions = (rankingsOptions: string[]) => {
    const region = rankedRegionSchema.parse(rankingsOptions[1])
    const page = z.coerce.number().catch(1).parse(rankingsOptions[2])

    return {
        region,
        page,
    }
}

export const generateMetadata = ({
    params: { rankingsOptions = [] },
}: Rankings2v2PageProps): Metadata => {
    if (rankingsOptions[0] !== "2v2") return {}

    const { region, page } = getRankingsOptions(rankingsOptions)

    const title = `Brawlhalla ${
        region === "all" ? "Global" : region.toUpperCase()
    } 2v2 Rankings - Page ${page} • Corehalla`

    return {
        title,
        description: title,
    }
}

export default async function Rankings2v2Page({
    params: { rankingsOptions = [] },
}: Rankings2v2PageProps) {
    const { region, page } = getRankingsOptions(rankingsOptions)
    const rankings = await get2v2Rankings(region, page)

    const pagination = (
        <RankingsPagination page={page} baseHref={`/ranked/2v2/${region}`} />
    )

    return (
        <>
            {pagination}
            <div className="py-4 w-full h-full hidden md:flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-8 text-center">Tier</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Player 1</p>
                <p className="flex-1">Player 2</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            <Rankings2v2Table rankings={rankings} />
            {pagination}
        </>
    )
}
