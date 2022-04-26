import { Player2v2Tab } from "ui/stats/player/Player2v2Tab"
import { PlayerLegendsTab } from "ui/stats/player/PlayerLegendsTab"
import { PlayerOverviewTab } from "ui/stats/player/PlayerOverviewTab"
import { PlayerWeaponsTab } from "ui/stats/player/PlayerWeaponsTab"
import { QueryClient, dehydrate } from "react-query"
import { SEO } from "../../../components/SEO"
import { StatsHeader } from "ui/stats/StatsHeader"
import {
    Root as Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@radix-ui/react-tabs"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css, theme } from "ui/theme"
import { formatTime } from "common/helpers/date"
import { getFullLegends, getFullWeapons } from "bhapi/legends"
import { getPlayerAliases } from "bhapi/helpers/getPlayerAliases"
import { getPlayerRanked, getPlayerStats } from "bhapi"
import { supabaseService } from "db/supabase/service"
import { usePlayerRanked } from "common/hooks/usePlayerRanked"
import { usePlayerStats } from "common/hooks/usePlayerStats"
import { useRouter } from "next/router"
import Image from "next/image"
import type { BHPlayer, BHPlayerAlias } from "db/generated/client"
import type { GetServerSideProps, NextPage } from "next"
import type { MiscStat } from "ui/stats/MiscStatGroup"

const tabClassName = cn(
    "px-6 py-4 uppercase text-xs border-b-2 z-10",
    css({
        borderColor: "transparent",
        color: theme.colors.textVar1,
        '&[data-state="active"]': {
            borderColor: theme.colors.accent,
            color: theme.colors.text,
        },
        "&:hover": {
            backgroundColor: theme.colors.bgVar2,
            borderColor: theme.colors.text,
            color: theme.colors.text,
        },
    })(),
)

type PageProps = {
    aliases: string[]
}

const Page: NextPage<PageProps> = ({ aliases }) => {
    const router = useRouter()
    const { playerId } = router.query
    const { playerStats, isLoading, isError } = usePlayerStats(
        playerId as string,
    )
    const { playerRanked } = usePlayerRanked(playerId as string)

    if (isLoading) return <p>Loading...</p>

    if (isError || !playerStats) return <p>Error</p>

    const fullLegends = getFullLegends(
        playerStats.legends,
        playerRanked?.legends,
    )

    const weapons = getFullWeapons(fullLegends)

    const {
        matchtime,
        kos,
        falls,
        suicides,
        teamkos,
        damagedealt,
        damagetaken,
    } = playerStats.legends.reduce<{
        matchtime: number
        kos: number
        falls: number
        suicides: number
        teamkos: number
        damagedealt: number
        damagetaken: number
    }>(
        (acc, legend) => ({
            matchtime: acc.matchtime + legend.matchtime,
            kos: acc.kos + legend.kos,
            falls: acc.falls + legend.falls,
            suicides: acc.suicides + legend.suicides,
            teamkos: acc.teamkos + legend.teamkos,
            damagedealt: acc.damagedealt + parseInt(legend.damagedealt),
            damagetaken: acc.damagetaken + parseInt(legend.damagetaken),
        }),
        {
            matchtime: 0,
            kos: 0,
            falls: 0,
            suicides: 0,
            teamkos: 0,
            damagedealt: 0,
            damagetaken: 0,
        },
    )

    const legendsSortedByLevel = fullLegends
        .slice(0)
        .sort((a, b) => (b.stats?.matchtime ?? 0) - (a.stats?.matchtime ?? 0))

    const accountStats: MiscStat[] = [
        {
            name: "Account level",
            value: playerStats.level,
        },
        {
            name: "Account XP",
            value: playerStats.xp,
        },
        {
            name: "Time spent in game",
            value: formatTime(matchtime),
        },
        {
            name: "Main legends",
            value: (
                <div className="flex gap-1">
                    {legendsSortedByLevel.slice(0, 3).map((legend) => (
                        <div
                            className="w-8 h-8 relative"
                            key={legend.legend_id}
                        >
                            <Image
                                src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                                alt={legend.bio_name}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        {
            name: "Main weapons",
            value: (
                <div className="flex gap-1">
                    {weapons
                        .map(({ weapon, legends }) => ({
                            weapon,
                            matchtime: legends.reduce(
                                (acc, legend) =>
                                    acc + (legend.stats?.matchtime ?? 0),
                                0,
                            ),
                        }))
                        .sort((a, b) => b.matchtime - a.matchtime)
                        .slice(0, 3)
                        .map((weapon) => (
                            <div
                                className="w-8 h-8 relative"
                                key={weapon.weapon}
                            >
                                <Image
                                    src={`/images/icons/weapons/${weapon.weapon}.png`}
                                    alt={weapon.weapon}
                                    layout="fill"
                                    objectFit="contain"
                                    objectPosition="center"
                                />
                            </div>
                        ))}
                </div>
            ),
        },
    ]

    return (
        <>
            <SEO
                title={`${playerStats.name} - Player Stats • Corehalla`}
                description={`${playerStats.name} Stats - Brawlhalla Player Stats • Corehalla`}
            />
            <StatsHeader
                name={cleanString(playerStats.name)}
                id={playerStats.brawlhalla_id}
                aliases={aliases}
                miscStats={accountStats}
                icon={
                    playerRanked?.region && (
                        <div className="relative mt-2 w-6 h-6 rounded overflow-hidden mr-2">
                            <Image
                                src={`/images/icons/flags/${playerRanked.region}.png`}
                                alt="Region Flag"
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                            />
                        </div>
                    )
                }
                favorite={{
                    type: "player",
                    id: playerStats.brawlhalla_id.toString(),
                    name: cleanString(playerStats.name),
                    meta: {
                        icon: {
                            type: "legend",
                            legend_id: legendsSortedByLevel[0].legend_id,
                        },
                    },
                }}
            />
            <Tabs defaultValue="overview">
                <TabsList
                    aria-label="Manage your account"
                    className="relative flex mt-8 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-bgVar1"
                >
                    <TabsTrigger value="overview" className={tabClassName}>
                        Overview
                    </TabsTrigger>
                    {playerRanked && playerRanked["2v2"].length > 0 && (
                        <TabsTrigger value="2v2" className={tabClassName}>
                            2v2 Ranked
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="legends" className={tabClassName}>
                        Legends
                    </TabsTrigger>
                    <TabsTrigger value="weapons" className={tabClassName}>
                        Weapons
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <PlayerOverviewTab
                        stats={playerStats}
                        ranked={playerRanked}
                        legends={fullLegends}
                        damageDealt={damagedealt}
                        damageTaken={damagetaken}
                        kos={kos}
                        falls={falls}
                        suicides={suicides}
                        teamkos={teamkos}
                        matchtime={matchtime}
                    />
                </TabsContent>
                {playerRanked && playerRanked["2v2"].length > 0 && (
                    <TabsContent value="2v2">
                        <Player2v2Tab ranked={playerRanked} />
                    </TabsContent>
                )}
                <TabsContent value="legends">
                    <PlayerLegendsTab
                        legends={fullLegends}
                        matchtime={matchtime}
                        games={playerStats.games}
                    />
                </TabsContent>
                <TabsContent value="weapons">
                    <PlayerWeaponsTab
                        weapons={weapons}
                        matchtime={matchtime}
                        games={playerStats.games}
                    />
                </TabsContent>
            </Tabs>
        </>
    )
}

export default Page

export const getServerSideProps: GetServerSideProps = async ({
    query,
    res,
}) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=480",
    )

    const { playerId } = query
    if (!playerId || typeof playerId !== "string") return { notFound: true }
    const queryClient = new QueryClient()

    // TODO: Error handling
    const [stats, ranked] = await Promise.all([
        getPlayerStats(playerId),
        getPlayerRanked(playerId),
    ])

    const aliases = getPlayerAliases(stats, ranked)

    await Promise.all([
        queryClient.prefetchQuery(["playerStats", playerId], async () => stats),
        queryClient.prefetchQuery(["playerRanked", playerId], async () => {
            if (!ranked.brawlhalla_id) throw new Error("Player not ranked")
            return ranked
        }),
        supabaseService.from<BHPlayer>("BHPlayer").upsert({
            id: stats.brawlhalla_id.toString(),
            name: stats.name,
        }),
        supabaseService.from<BHPlayerAlias>("BHPlayerAlias").upsert(
            aliases.map((alias) => ({
                playerId: stats.brawlhalla_id.toString(),
                alias,
            })),
        ),
    ])

    const { data } = await supabaseService
        .from<BHPlayerAlias>("BHPlayerAlias")
        .select("alias")
        .eq("playerId", stats.brawlhalla_id.toString())

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
            aliases: [
                ...new Set([
                    ...(data?.map(({ alias }) => alias) ?? aliases),
                    ...aliases,
                ]),
            ],
        },
    }
}
