import type { MetaFloor } from "@crh/api-contract/schemas"
import type { LegendMetaRow } from "./legendMeta"
import type { WeaponMetaTableRow } from "./weaponMeta"

export type LegendMetaCsvRow = {
    readonly name: string
    readonly row: LegendMetaRow
}

const lineEnding = "\r\n"

/** RFC 4180: a field with a comma, a quote or a line break is quoted, inner quotes doubled. */
const metaCsvField = (value: string): string =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

/** Some roster names carry invisible formatting characters the board never shows. */
const metaCsvName = (name: string): string =>
    name.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")

const record = (fields: readonly string[]): string =>
    fields.map(metaCsvField).join(",")

const document = (lines: readonly string[]): string =>
    `${lines.join(lineEnding)}${lineEnding}`

const count = (value: number | null): string =>
    value === null ? "" : String(Math.round(value))

/** Fractions of one at the aggregate's precision, never a percentage. */
const rate = (value: number | null): string =>
    value === null ? "" : value.toFixed(4)

const duration = (value: number | null): string =>
    value === null ? "" : String(Math.round(value))

const average = (value: number | null): string =>
    value === null ? "" : String(value)

const legendHeader = [
    "Legend",
    "Games",
    "Wins",
    "Win rate",
    "Play share",
    "Accounts",
    "Damage per game",
    "Average match seconds",
    "Suicides per 100 games",
] as const

const weaponHeader = [
    "Weapon",
    "Games",
    "Wins",
    "Win rate",
    "Play share",
    "Accounts",
    "Damage per game",
    "Time held per game",
    "KOs per game",
] as const

export const metaCsvFilename = (
    board: "legends" | "weapons",
    floor: MetaFloor,
): string => `corehalla-${board}-${floor}.csv`

export const legendMetaCsv = (rows: readonly LegendMetaCsvRow[]): string =>
    document([
        record(legendHeader),
        ...rows.map(({ name, row }) =>
            record([
                metaCsvName(name),
                count(row.games),
                count(row.wins),
                rate(row.winRate),
                rate(row.playShare),
                count(row.accounts),
                average(row.playStyle.damageDealtPerGame),
                duration(row.playStyle.averageMatchSeconds),
                average(row.playStyle.suicidesPer100Games),
            ]),
        ),
    ])

export const weaponMetaCsv = (rows: readonly WeaponMetaTableRow[]): string =>
    document([
        record(weaponHeader),
        ...rows.map(({ weapon, meta }) =>
            record([
                weapon,
                count(meta?.games ?? null),
                count(meta?.wins ?? null),
                rate(meta?.winRate ?? null),
                rate(meta?.playShare ?? null),
                count(meta?.accounts ?? null),
                average(meta?.damagePerGame ?? null),
                duration(meta?.timeHeldPerGame ?? null),
                average(meta?.kosPerGame ?? null),
            ]),
        ),
    ])
