/**
 * Shared SQL helpers for seed/import generators.
 *
 * Enforces D1's ~100 KB statement limit (default 90 KB headroom) and one
 * statement per line for line-by-line offline replay.
 */

export type Sql = string | number | boolean | null

export type InsertLimits = {
    /** Default 150. */
    readonly rows?: number
    /** Default 90_000 (D1 limit is 100_000). */
    readonly bytes?: number
}

const DEFAULT_ROWS = 150
const DEFAULT_BYTES = 90_000

/** Dates/booleans must be encoded before quoting. */
export const quoteSql = (value: Sql): string => {
    if (value === null) return "NULL"
    if (typeof value === "boolean") return value ? "1" : "0"
    if (typeof value === "number") return String(Math.trunc(value))

    return `'${value.replace(/'/g, "''")}'`
}

/** Greedy `INSERT OR IGNORE` groups under the row and byte limits. */
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

        // Oversized single row still gets its own statement — cannot split a row.
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
