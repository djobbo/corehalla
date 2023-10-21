import { type Metadata } from "next"
import { Rankings1v1Table } from "./Rankings1v1Table"
import { RankingsPagination } from "@/app/[locale]/(rankings)/RankingsPagination"
import { Search } from "@/app/[locale]/(rankings)/SearchInput"
import { SearchProvider } from "@/app/[locale]/(rankings)/SearchProvider"
import { get1v1Rankings } from "bhapi"
import { rankedRegionSchema } from "bhapi/constants"
import { z } from "zod"

type Rankings1v1PageProps = {
    params: {
        rankingsOptions?: string[]
    }
    searchParams: {
        player: string
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
    searchParams: { player: playerSearch = "" },
}: Rankings1v1PageProps): Metadata => {
    if (rankingsOptions[0] !== "1v1") return {}

    const { region, page } = getRankingsOptions(rankingsOptions)

    const title = `Brawlhalla ${
        region === "all" ? "Global" : region.toUpperCase()
    } 1v1 Rankings - Page ${page}${
        playerSearch ? ` - ${playerSearch}` : ""
    } • Corehalla`

    return {
        title,
        description: title,
    }
}

export default async function Rankings1v1Page({
    params: { rankingsOptions = [] },
    searchParams: { player: playerSearch = "" },
}: Rankings1v1PageProps) {
    const { region, page } = getRankingsOptions(rankingsOptions)
    const rankings = await get1v1Rankings(region, page, playerSearch)

    const pagination = (
        <RankingsPagination page={page} baseHref={`/ranked/1v1/${region}`} />
    )

    return (
        <SearchProvider defaultSearch={playerSearch}>
            <Search
                placeholder="Search player..."
                subtitle="Search must start with exact match. Players must have played 10 ranked games this season."
                searchParamName="player"
            />
            {pagination}
            <div className="py-4 w-full h-full items-center gap-4 hidden md:flex">
                <p className="w-16 text-center">Rank</p>
                <p className="w-8 text-center">Tier</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Name</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            <Rankings1v1Table rankings={rankings} />
            {pagination}
        </SearchProvider>
    )
}
