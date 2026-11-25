import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
import { StatGrid } from "@/components/common/StatGrid"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { weaponIconSrc } from "@/lib/assets"
import {
    legendAttributes,
    legendBoardHref,
    legendHref,
    relatedLegends,
} from "@/lib/legends"
import { weaponHref } from "@/lib/weapons"
import { playerHref, tierColor } from "@/lib/rankings"
import { LegendIcon } from "./LegendIcon"
import { LegendMetaCard } from "./LegendMetaCard"
import { LegendPlayStyleCard } from "./LegendPlayStyleCard"
import { cleanString } from "@crh/common/helpers/cleanString"
import type {
    CareerRanking,
    LegendMeta,
    LegendMetaFloor,
    LegendPlayStyle,
} from "@crh/api-contract/schemas"
import type { Legend } from "@crh/bhapi/types"
import type { CSSProperties } from "react"

const TOP_MAIN_COUNT = 10

const RELATED_LEGEND_COUNT = 6

const AttributeGrid = ({ legend }: { readonly legend: Legend }) => {
    const attributes = legendAttributes(legend)

    return (
        <StatGrid
            stats={[
                { title: "Strength", value: `${attributes.strength} / 10` },
                { title: "Dexterity", value: `${attributes.dexterity} / 10` },
                { title: "Defense", value: `${attributes.defense} / 10` },
                { title: "Speed", value: `${attributes.speed} / 10` },
            ]}
        />
    )
}

const WeaponChip = ({ weapon }: { readonly weapon: Legend["weapon_one"] }) => (
    <Link
        to={weaponHref(weapon)}
        className="ch-chip ch-chip-off inline-flex items-center gap-1.5"
    >
        <img
            src={weaponIconSrc(weapon)}
            alt=""
            className="size-5 shrink-0 object-contain"
        />
        {weapon}
    </Link>
)

const MainRow = ({
    row,
    rank,
}: {
    readonly row: CareerRanking
    readonly rank: number
}) => (
    <TableRow>
        <TableCell>
            <span className="ch-rank">
                <span>{rank}</span>
            </span>
        </TableCell>
        <TableCell>
            <EntityLink
                type="player"
                id={row.id}
                href={playerHref(row.slug)}
                className="font-semibold"
            >
                {cleanString(row.name)}
            </EntityLink>
        </TableCell>
        <TableCell className="text-right">
            {row.tier ? (
                <span
                    className="ch-tier"
                    style={
                        { "--ch-tier": tierColor(row.tier) } as CSSProperties
                    }
                >
                    {row.tier}
                </span>
            ) : null}
        </TableCell>
        <TableCell className="text-right font-bold tabular-nums">
            {row.prop.toLocaleString()}
        </TableCell>
    </TableRow>
)

export const LegendView = ({
    legend,
    rows,
    playStyle = null,
    meta = null,
    floor = "all",
    onMetaFloorChange,
}: {
    readonly legend: Legend
    readonly rows: readonly CareerRanking[]
    readonly playStyle?: LegendPlayStyle | null
    readonly meta?: LegendMeta | null
    readonly floor?: LegendMetaFloor
    readonly onMetaFloorChange?: (floor: LegendMetaFloor) => void
}) => {
    const mains = rows.slice(0, TOP_MAIN_COUNT)
    const related = relatedLegends(legend, RELATED_LEGEND_COUNT)

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <header className="ch-hero mb-3">
                <Link to="/legends" className="ch-kicker hover:text-foreground">
                    <span aria-hidden>&larr;</span> All legends
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <LegendIcon
                        legend={legend}
                        className="size-16 shrink-0 object-contain md:size-20"
                    />
                    <div className="flex min-w-0 flex-col">
                        <h1 className="ch-display text-2xl md:text-3xl">
                            {legend.bio_name}
                        </h1>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {legend.bio_aka}
                        </p>
                    </div>
                </div>
            </header>

            <LegendMetaCard
                meta={meta}
                legendId={legend.legend_id}
                floor={floor}
                onFloorChange={onMetaFloorChange}
            />

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Weapons</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5">
                        <WeaponChip weapon={legend.weapon_one} />
                        <WeaponChip weapon={legend.weapon_two} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attributes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttributeGrid legend={legend} />
                    </CardContent>
                </Card>
            </div>

            {playStyle === null ? null : (
                <LegendPlayStyleCard
                    legend={legend}
                    playStyle={playStyle}
                    className="mt-3"
                />
            )}

            <section className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="ch-display text-lg">Top mains</h2>
                    <Link
                        to={legendBoardHref(legend)}
                        className="ch-kicker hover:text-foreground"
                    >
                        Full career board <span aria-hidden>&rarr;</span>
                    </Link>
                </div>

                {mains.length === 0 ? (
                    <Empty className="mt-3 rounded-none bg-card shadow-md py-10">
                        <EmptyHeader>
                            <EmptyDescription>
                                No players on this legend&apos;s board yet.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <Card className="mt-3 overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-7">#</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="w-24 text-right">
                                        Tier
                                    </TableHead>
                                    <TableHead className="w-24 text-right">
                                        Games
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mains.map((row, index) => (
                                    <MainRow
                                        key={row.id}
                                        row={row}
                                        rank={index + 1}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </section>

            {related.length > 0 && (
                <section className="mt-6">
                    <h2 className="ch-display text-lg">Shares a weapon</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {related.map((entry) => (
                            <Link
                                key={entry.legend_id}
                                to={legendHref(entry)}
                                className="ch-chip ch-chip-off"
                            >
                                {entry.bio_name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
