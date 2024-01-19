import { type BHClan } from "db/generated/client"
import { BracketSelection } from "../../BracketSelection"
import { CLANS_RANKINGS_PER_PAGE } from "./constants"
import { ClansTable } from "./ClansTable"
import { type Metadata } from "next"
import { RankingsPagination } from "../../RankingsPagination"
import { Search } from "@/app/[locale]/(rankings)/SearchInput"
import { SearchProvider } from "@/app/[locale]/(rankings)/SearchProvider"
import { supabaseService } from "db/supabase/service"
import { z } from "zod"

type RankingsClansPageProps = {
    params: {
        clansRankingsOptions?: string[]
    }
    searchParams: {
        clan?: string
    }
}

const fetchClansRankings = async (page: number, name?: string) => {
    let query = supabaseService.from<BHClan>("BHClan").select("*")

    const cleanName = name?.trim().replace(/'/g, "\\'") || ""

    if (cleanName.length > 0) {
        query = query.ilike("name", `${cleanName}%`)
    } else {
        query = query.select("*")
    }

    const { data, error } = await query
        .order("xp", { ascending: false })
        .range(
            (page - 1) * CLANS_RANKINGS_PER_PAGE,
            page * CLANS_RANKINGS_PER_PAGE - 1,
        )

    if (error) {
        throw error
    }

    // TODO: type check this with zod
    return data
}

const getClansRankingsOptions = (clansRankingsOptions: string[]) => {
    const page = z.coerce.number().catch(1).parse(clansRankingsOptions[0])

    return {
        page,
    }
}

export const generateMetadata = ({
    params: { clansRankingsOptions = [] },
    searchParams: { clan: clanSearch = "" },
}: RankingsClansPageProps): Metadata => {
    const { page } = getClansRankingsOptions(clansRankingsOptions)

    const title = `Brawlhalla Clans - Page ${page}${
        clanSearch ? ` - ${clanSearch}` : ""
    } • Corehalla`

    return {
        title,
        description: title,
    }
}

export default async function RankingsClansPage({
    params: { clansRankingsOptions = [] },
    searchParams: { clan: clanSearch },
}: RankingsClansPageProps) {
    const { page } = getClansRankingsOptions(clansRankingsOptions)
    const clans = await fetchClansRankings(page, clanSearch)

    const pagination = <RankingsPagination page={page} baseHref="/clans" />

    return (
        <>
            <BracketSelection />
            <SearchProvider defaultSearch={clanSearch}>
                <Search
                    placeholder="Search clan..."
                    subtitle="Search must start with exact match."
                    searchParamName="clan"
                />
                {pagination}
                <ClansTable clans={clans} page={page} />
                {pagination}
            </SearchProvider>
        </>
    )
}
