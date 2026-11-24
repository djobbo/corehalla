import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
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
import { weaponBoard } from "@/lib/careerRankings"
import { legendHref } from "@/lib/legends"
import { playerHref, tierColor } from "@/lib/rankings"
import { legendsWithWeapon, weaponCareerHref } from "@/lib/weapons"
import { cleanString } from "@crh/common/helpers/cleanString"
import { WeaponMetaCard } from "./WeaponMetaCard"
import type { CareerRanking, WeaponMeta } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"
import type { CSSProperties } from "react"

const PlayerRow = ({
    row,
    rank,
    metric,
}: {
    readonly row: CareerRanking
    readonly rank: number
    readonly metric: { readonly format: (value: number) => string }
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
            {metric.format(row.prop)}
        </TableCell>
    </TableRow>
)

export const WeaponView = ({
    weapon,
    rows,
    meta,
}: {
    readonly weapon: Weapon
    readonly rows: readonly CareerRanking[]
    readonly meta: WeaponMeta | null
}) => {
    const wielders = legendsWithWeapon(weapon)
    const metric = weaponBoard.option(weaponBoard.defaultSort)

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <Link to="/weapons" className="ch-kicker hover:text-foreground">
                    <span aria-hidden>&larr;</span> All weapons
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <img
                        src={weaponIconSrc(weapon)}
                        alt=""
                        className="size-16 shrink-0 object-contain md:size-20"
                    />
                    <h1 className="ch-display text-2xl md:text-3xl">
                        {weapon}
                    </h1>
                </div>
            </header>

            {meta === null ? null : (
                <WeaponMetaCard meta={meta} weapon={weapon} />
            )}

            <section>
                <h2 className="ch-display text-lg">Legends that wield it</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {wielders.map((legend) => (
                        <Link
                            key={legend.legend_id}
                            to={legendHref(legend)}
                            className="ch-chip ch-chip-off"
                        >
                            {legend.bio_name}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="ch-display text-lg">Top career players</h2>
                    <Link
                        to={weaponCareerHref(weapon, weaponBoard.defaultSort)}
                        className="ch-kicker hover:text-foreground"
                    >
                        Full career board <span aria-hidden>&rarr;</span>
                    </Link>
                </div>

                {rows.length === 0 ? (
                    <Empty className="mt-3 rounded-2xl bg-card py-10">
                        <EmptyHeader>
                            <EmptyDescription>
                                No players on this weapon&apos;s board yet.
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
                                        {metric.label}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <PlayerRow
                                        key={row.id}
                                        row={row}
                                        rank={index + 1}
                                        metric={metric}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </section>
        </main>
    )
}
