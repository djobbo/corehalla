import { Link } from "@tanstack/react-router"
import { MetaCsvDownload } from "@/components/common/MetaCsvDownload"
import { MetaFloorChips } from "@/components/common/MetaFloorChips"
import { SelectField } from "@/components/common/SelectField"
import { Card } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { weaponIconSrc } from "@/lib/assets"
import { metaDisclaimer, metaEmpty, metaFloorSample } from "@/lib/metaFloor"
import { metaCsvFilename, weaponMetaCsv } from "@/lib/metaCsv"
import { weaponHref, weaponIndex } from "@/lib/weapons"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaAverage,
    weaponMetaDefaultDirection,
    weaponMetaDefaultSort,
    weaponMetaSorts,
    weaponMetaTableRows,
} from "@/lib/weaponMeta"
import { useSortBy } from "@/lib/useSortBy"
import type { MetaFloor } from "@crh/api-contract/schemas"
import type {
    WeaponMeta,
    WeaponMetaSort,
    WeaponMetaTableRow,
} from "@/lib/weaponMeta"

export type WeaponIndexProps = {
    readonly meta: WeaponMeta | null
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}

/** The phone row: the columns the board stacks under the weapon name. */
const PhoneRecord = ({ row }: { readonly row: WeaponMetaTableRow }) => (
    <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[0.66rem] text-muted-foreground sm:hidden">
        <span>{formatWeaponMetaRate(row.meta?.winRate ?? null)} win rate</span>
        <span>{weaponMetaAverage(row.meta?.damagePerGame ?? null)} damage</span>
        <span>
            {formatWeaponMetaDuration(row.meta?.timeHeldPerGame ?? null)} held
        </span>
        <span>{weaponMetaAverage(row.meta?.kosPerGame ?? null)} KOs</span>
        <span>{formatWeaponMetaCount(row.meta?.games ?? null)} games</span>
        <span>
            {formatWeaponMetaCount(row.meta?.accounts ?? null)} accounts
        </span>
    </span>
)

const MetaTable = ({
    meta,
    floor,
    onFloorChange,
}: {
    readonly meta: WeaponMeta
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}) => {
    const { sorted, key, setKey, choices } = useSortBy<
        WeaponMetaTableRow,
        WeaponMetaSort
    >(
        weaponMetaTableRows(meta),
        weaponMetaSorts,
        weaponMetaDefaultSort,
        weaponMetaDefaultDirection,
    )

    const csv = weaponMetaCsv(sorted)

    return (
        <section aria-labelledby="weapon-meta-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Play share and win rate</p>
                    <h2
                        id="weapon-meta-title"
                        className="ch-display mt-1 text-lg"
                    >
                        Weapon meta
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {metaFloorSample(meta.meta.accounts, floor)} ·{" "}
                        {metaDisclaimer}
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <MetaFloorChips
                        floor={floor}
                        onFloorChange={onFloorChange}
                    />
                    {meta.data.length === 0 ? null : (
                        <MetaCsvDownload
                            filename={metaCsvFilename("weapons", floor)}
                            csv={csv}
                        />
                    )}
                </div>
            </div>

            {meta.data.length === 0 ? (
                <NoSample floor={floor} />
            ) : (
                <>
                    <SelectField
                        label="Sort by"
                        value={key}
                        options={choices}
                        onChange={setKey}
                        className="mt-3 sm:max-w-xs"
                    />

                    <Card className="mt-3 overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Weapon</TableHead>
                                    <TableHead className="w-20 text-right">
                                        Play share
                                    </TableHead>
                                    <TableHead className="hidden w-20 text-right sm:table-cell">
                                        Win rate
                                    </TableHead>
                                    <TableHead className="hidden w-28 text-right sm:table-cell">
                                        Damage / game
                                    </TableHead>
                                    <TableHead className="hidden w-32 text-right sm:table-cell">
                                        Time held / game
                                    </TableHead>
                                    <TableHead className="hidden w-24 text-right sm:table-cell">
                                        KOs / game
                                    </TableHead>
                                    <TableHead className="hidden w-20 text-right sm:table-cell">
                                        Games
                                    </TableHead>
                                    <TableHead className="hidden w-20 text-right sm:table-cell">
                                        Accounts
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map((row) => (
                                    <TableRow key={row.weapon}>
                                        <TableCell className="whitespace-normal">
                                            <Link
                                                to={weaponHref(row.weapon)}
                                                className="flex items-center gap-2 font-semibold transition-colors hover:text-ring"
                                            >
                                                <img
                                                    src={weaponIconSrc(
                                                        row.weapon,
                                                    )}
                                                    alt=""
                                                    className="size-7 shrink-0 object-contain"
                                                />
                                                <span className="flex min-w-0 flex-col">
                                                    {row.weapon}
                                                    <PhoneRecord row={row} />
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right font-bold tabular-nums">
                                            {formatWeaponMetaRate(
                                                row.meta?.playShare ?? null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {formatWeaponMetaRate(
                                                row.meta?.winRate ?? null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {weaponMetaAverage(
                                                row.meta?.damagePerGame ?? null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {formatWeaponMetaDuration(
                                                row.meta?.timeHeldPerGame ??
                                                    null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {weaponMetaAverage(
                                                row.meta?.kosPerGame ?? null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                                            {formatWeaponMetaCount(
                                                row.meta?.games ?? null,
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                                            {formatWeaponMetaCount(
                                                row.meta?.accounts ?? null,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}
        </section>
    )
}

/** The catalogue the page falls back to while the meta read is unavailable. */
const Catalogue = () => (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weaponIndex().map(({ weapon, wielders }) => (
            <li key={weapon}>
                <Link
                    to={weaponHref(weapon)}
                    className="block h-full transition-transform hover:-translate-y-0.5 focus-visible:outline-2"
                >
                    <Card className="h-full py-0">
                        <span className="flex h-full items-center gap-3 p-3">
                            <img
                                src={weaponIconSrc(weapon)}
                                alt=""
                                className="size-12 shrink-0 object-contain"
                            />
                            <span className="flex min-w-0 flex-col">
                                <span className="font-semibold">{weapon}</span>
                                <span className="text-xs text-muted-foreground">
                                    {wielders
                                        .map((legend) => legend.bio_name)
                                        .join(" · ")}
                                </span>
                            </span>
                        </span>
                    </Card>
                </Link>
            </li>
        ))}
    </ul>
)

const NoSample = ({ floor }: { readonly floor: MetaFloor }) => (
    <Empty className="mt-4 rounded-none bg-card py-10 shadow-md">
        <EmptyHeader>
            <EmptyTitle>No sample</EmptyTitle>
            <EmptyDescription>{metaEmpty("weapon", floor)}</EmptyDescription>
        </EmptyHeader>
    </Empty>
)

export const WeaponIndex = ({
    meta,
    floor,
    onFloorChange,
}: WeaponIndexProps) => (
    <main id="main" tabIndex={-1} className="ch-page">
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Brawlhalla arsenal</p>
            <h1 className="ch-display mt-1 text-2xl">Weapons</h1>
            <p className="mt-1 text-xs text-muted-foreground">
                Every weapon in the game, compared on play share, win rate and
                per-game output.
            </p>
        </header>

        {meta === null ? (
            <Catalogue />
        ) : (
            <MetaTable
                meta={meta}
                floor={floor}
                onFloorChange={onFloorChange}
            />
        )}
    </main>
)
