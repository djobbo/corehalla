import { Image } from "@components/Image"
import { Player2v2Tab } from "@components/stats/player/Player2v2Tab"
import { PlayerLegendsTab } from "@components/stats/player/PlayerLegendsTab"
import { PlayerOverviewTab } from "@components/stats/player/PlayerOverviewTab"
import { PlayerWeaponsTab } from "@components/stats/player/PlayerWeaponsTab"
import { SEO } from "@components/SEO"
import { StatsHeader } from "@components/stats/StatsHeader"
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
import { usePlayerAliases } from "@hooks/stats/usePlayerAliases"
import { usePlayerRanked } from "@hooks/stats/usePlayerRanked"
import { usePlayerStats } from "@hooks/stats/usePlayerStats"
import { useRouter } from "next/router"
import type { MiscStat } from "@components/stats/MiscStatGroup"
import type { NextPage } from "next"

const tabClassName = cn(
    "px-6 py-4 uppercase text-xs border-b-2 z-10 whitespace-nowrap",
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

const Page: NextPage = () => {
    const router = useRouter()
    const { playerId } = router.query
    const { playerStats, isLoading, isError } = usePlayerStats(
        playerId as string,
    )
    const { playerRanked } = usePlayerRanked(playerId as string)
    const { playerAliases } = usePlayerAliases(playerId as string)

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
            desc: `${playerStats.name}'s account level`,
        },
        {
            name: "Account XP",
            value: playerStats.xp,
            desc: `${playerStats.name}'s account XP`,
        },
        {
            name: "Game time",
            value: formatTime(matchtime),
            desc: `Time ${playerStats.name} spent in game`,
        },
        {
            name: "Main legends",
            value: (
                <div className="flex gap-1">
                    {legendsSortedByLevel.slice(0, 3).map((legend) => (
                        <Image
                            key={legend.legend_id}
                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                            alt={legend.bio_name}
                            containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                            className="object-contain object-center"
                        />
                    ))}
                </div>
            ),
            desc: `${playerStats.name}'s main legends`,
        },
        {
            name: "Main weapons",
            value: (
                <div className="flex gap-1">
                    {weapons
                        .map(({ weapon, legends }) => ({
                            weapon,
                            matchtime: legends.reduce((acc, legend) => {
                                const matchtime =
                                    weapon === legend.weapon_one
                                        ? legend.stats?.timeheldweaponone
                                        : legend.stats?.timeheldweapontwo
                                return acc + (matchtime ?? 0)
                            }, 0),
                        }))
                        .sort((a, b) => b.matchtime - a.matchtime)
                        .slice(0, 3)
                        .map((weapon) => (
                            <Image
                                key={weapon.weapon}
                                src={`/images/icons/weapons/${weapon.weapon}.png`}
                                alt={weapon.weapon}
                                containerClassName="w-8 h-8"
                                className="object-contain object-center"
                            />
                        ))}
                </div>
            ),
            desc: `${playerStats.name}'s main weapons`,
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
                aliases={playerAliases}
                miscStats={accountStats}
                icon={
                    playerRanked?.region && (
                        <Image
                            src={`/images/icons/flags/${playerRanked.region}.png`}
                            alt="Region Flag"
                            containerClassName="mt-2 w-6 h-6 rounded overflow-hidden mr-2"
                            className="object-contain object-center"
                        />
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
                <TabsList className="relative flex mt-8 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-bgVar1 overflow-x-scroll">
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

// export const getServerSideProps: GetServerSideProps = async ({
//     query,
//     res,
// }) => {
//     const { playerId } = query
//     if (!playerId || typeof playerId !== "string") return { notFound: true }

//     try {
//         const [stats, ranked] = await Promise.all([
//             getPlayerStats(playerId),
//             getPlayerRanked(playerId),
//         ])

//         const aliases = [
//             {
//                 id: stats.brawlhalla_id,
//                 name: stats.name,
//             },
//             ...(ranked["2v2"]?.map(getTeamPlayers).flat() ?? []),
//         ]

//         const curratedAliases = aliases
//             .filter(
//                 (alias, i) =>
//                     aliases.findIndex(
//                         (a) => a.id === alias.id && a.name === alias.name,
//                     ) === i,
//             )
//             .map<BHPlayerAlias>(({ name, id }) => ({
//                 playerId: id.toString(),
//                 alias: name,
//             }))

//         await Promise.all([
//             queryClient.prefetchQuery(["playerStats", playerId], async () => {
//                 if (!stats?.brawlhalla_id) throw new Error("Player not ranked")
//                 return stats
//             }),
//             queryClient.prefetchQuery(["playerRanked", playerId], async () => {
//                 if (!ranked?.brawlhalla_id) throw new Error("Player not ranked")
//                 return ranked
//             }),
//             supabaseService.from<BHPlayer>("BHPlayer").upsert({
//                 id: stats.brawlhalla_id.toString(),
//                 name: stats.name,
//             }),
//             supabaseService
//                 .from<BHPlayerAlias>("BHPlayerAlias")
//                 .upsert(curratedAliases),
//             queryClient.prefetchQuery(["playerAliases", playerId], async () =>
//                 curratedAliases
//                     .filter((alias) => alias.playerId === playerId)
//                     .map((alias) => alias.alias),
//             ),
//         ])

//         res.setHeader(
//             "Cache-Control",
//             "public, s-maxage=480, stale-while-revalidate=600",
//         )

//         return {
//             props: {
//                 dehydratedState: dehydrate(queryClient),
//             },
//         }
//     } catch {
//         return { notFound: true }
//     }
// }
