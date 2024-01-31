import { type Metadata } from "next"
import { RankingsPagination } from "@/app/[locale]/(rankings)/RankingsPagination"
import { RankingsRotatingTable } from "./RankingsRotatingTable"
import { Search } from "@/app/[locale]/(rankings)/SearchInput"
import { SearchProvider } from "@/app/[locale]/(rankings)/SearchProvider"
import { getRotatingRankings } from "bhapi"
import { rankedRegionSchema } from "bhapi/constants"
import { z } from "zod"

type RankingsRotatingPageProps = {
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
}: RankingsRotatingPageProps): Metadata => {
    if (rankingsOptions[0] !== "rotating") return {}

    const { region, page } = getRankingsOptions(rankingsOptions)

    const title = `Brawlhalla ${
        region === "all" ? "Global" : region.toUpperCase()
    } Rotating Rankings - Page ${page}${
        playerSearch ? ` - ${playerSearch}` : ""
    } • Corehalla`

    return {
        title,
        description: title,
    }
}

export default async function RankingsRotatingPage({
    params: { rankingsOptions = [] },
    searchParams: { player: playerSearch = "" },
}: RankingsRotatingPageProps) {
    const { region, page } = getRankingsOptions(rankingsOptions)
    const rankings = await getRotatingRankings(region, page, playerSearch)

    const pagination = (
        <RankingsPagination
            page={page}
            baseHref={`/ranked/rotating/${region}`}
        />
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
            <RankingsRotatingTable rankings={rankings} />
            {pagination}
        </SearchProvider>
    )
}
