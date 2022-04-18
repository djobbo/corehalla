import { Player2v2Tab } from "ui/stats/player/Player2v2Tab"
import { PlayerLegendsTab } from "ui/stats/player/PlayerLegendsTab"
import { PlayerOverviewTab } from "ui/stats/player/PlayerOverviewTab"
import { PlayerWeaponsTab } from "ui/stats/player/PlayerWeaponsTab"
import { QueryClient, dehydrate } from "react-query"
import { StatsHeader } from "ui/stats/StatsHeader"
import {
    Root as Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@radix-ui/react-tabs"
import { bg, css, theme } from "ui/theme"
import { cn } from "common/helpers/classnames"
import { formatTime } from "common/helpers/date"
import { getFullLegends, getFullWeapons } from "bhapi/legends"
import { getPlayerRanked, getPlayerStats } from "bhapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { usePlayerRanked } from "bhapi/hooks/usePlayerRanked"
import { usePlayerStats } from "bhapi/hooks/usePlayerStats"
import { useRouter } from "next/router"
import Image from "next/image"
import type { GetServerSideProps, NextPage } from "next"
import type { MiscStat } from "ui/stats/MiscStatGroup"

const tabClassName = cn(
    "px-6 py-4 uppercase text-xs border-b-2 z-10",
    css({
        borderColor: "transparent",
        '&[data-state="active"]': {
            borderColor: theme.colors.blue9,
            color: theme.colors.blue9,
        },
        "&:hover": {
            backgroundColor: theme.colors.blue3,
            borderColor: theme.colors.blue7,
        },
    })(),
)

const Page: NextPage = () => {
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

    const aliases = playerRanked?.["2v2"] && [
        ...new Set([
            playerStats.name,
            ...playerRanked["2v2"].map(
                (team) =>
                    getTeamPlayers(playerRanked.brawlhalla_id, team).playerName,
            ),
        ]),
    ]

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
                                src={`/images/icons/legends/${legend.bio_name}.png`}
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
            <StatsHeader
                name={playerStats.name}
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
                    id: playerStats.brawlhalla_id,
                    legend_id: legendsSortedByLevel[0].legend_id,
                    name: playerStats.name,
                }}
            />
            <Tabs defaultValue="overview">
                <TabsList
                    aria-label="Manage your account"
                    className={cn(
                        "relative flex mt-8 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5",
                        bg("blue4", "&::before"),
                    )}
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { playerId } = query
    if (!playerId || typeof playerId !== "string") return { notFound: true }
    const queryClient = new QueryClient()

    await Promise.all([
        queryClient.prefetchQuery(["playerStats", playerId], () =>
            getPlayerStats(playerId),
        ),
        queryClient.prefetchQuery(["playerRanked", playerId], () =>
            getPlayerRanked(playerId),
        ),
    ])

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    }
}
