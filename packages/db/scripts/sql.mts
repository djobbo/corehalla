/**
 * Shared SQL-literal helpers for the checked-in generators (`seed.mts`,
 * `import-postgres.mts`).
 *
 * Both write SQL that D1 ingests verbatim, so the two hard limits are enforced
 * while the statements are built:
 *
 * - **100 KB per statement.** `insertStatements` splits a batch whenever the
 *   next row would push the statement over `bytes` (default 90 KB, leaving
 *   headroom for the header).
 * - **One statement per line.** Every statement is emitted as a single line
 *   (values are joined with `, `, never a newline) so the offline verifier can
 *   replay a generated file line by line without parsing SQL.
 */

export type Sql = string | number | boolean | null

export type InsertLimits = {
    /** Maximum rows per statement (default 150). */
    readonly rows?: number
    /** Maximum bytes per statement (default 90_000, D1's limit is 100_000). */
    readonly bytes?: number
}

const DEFAULT_ROWS = 150
const DEFAULT_BYTES = 90_000

/** Quote a value as a SQLite literal. Dates/booleans must be encoded first. */
export const quoteSql = (value: Sql): string => {
    if (value === null) return "NULL"
    if (typeof value === "boolean") return value ? "1" : "0"
    if (typeof value === "number") return String(Math.trunc(value))

    return `'${value.replace(/'/g, "''")}'`
}

/**
 * Render rows as `INSERT OR IGNORE` statements, greedily grouped so that no
 * statement exceeds the row or byte limit. Returns one single-line statement
 * per group.
 */
export const insertStatements = (
    table: string,
    columns: readonly string[],
    rows: readonly (readonly Sql[])[],
    limits: InsertLimits = {},
): string[] => {
    const maxRows = Math.max(1, Math.floor(limits.rows ?? DEFAULT_ROWS))
    const maxBytes = Math.max(256, Math.floor(limits.bytes ?? DEFAULT_BYTES))
    const columnList = columns.map((column) => `"${column}"`).join(", ")
    const head = `INSERT OR IGNORE INTO "${table}" (${columnList}) VALUES `

    const statements: string[] = []
    let group: string[] = []
    let bytes = head.length + 1

    const flush = () => {
        if (group.length === 0) return

        statements.push(`${head}${group.join(", ")};`)
        group = []
        bytes = head.length + 1
    }

    for (const row of rows) {
        const tuple = `(${row.map(quoteSql).join(", ")})`
        const width = tuple.length + 2

        // A single row wider than the byte budget still gets its own statement:
        // splitting a row is impossible, so let D1 report the oversized row.
        if (
            group.length > 0 &&
            (group.length >= maxRows || bytes + width > maxBytes)
        ) {
            flush()
        }

        group.push(tuple)
        bytes += width
    }

    flush()

    return statements
}
