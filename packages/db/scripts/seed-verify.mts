#!/usr/bin/env node
/**
 * Local, offline validation of the D1 schema, the seed generator and any
 * generated import file.
 *
 * Applies every generated migration to a `node:sqlite` database (no D1, no
 * billing, no wrangler), then either runs a small deterministic slice of the
 * seed generator or replays real `.sql` files line by line. Finally it checks
 * the row counts, foreign keys and that the hot queries use the indexes they
 * are supposed to.
 *
 *   pnpm db:seed:verify
 *   pnpm db:seed:verify -- --rows=50000
 *   pnpm db:seed:verify -- --dir=packages/db/seed/generated/supabase
 *   pnpm db:seed:verify -- --dir=... --db=/tmp/corehalla-verify.sqlite
 *
 * `--dir` paths are resolved from the repo root. Generated files hold one
 * statement per line, which is what makes the line-by-line replay possible.
 */
import {
    createReadStream,
    existsSync,
    readdirSync,
    readFileSync,
} from "node:fs"
import { createInterface } from "node:readline"
import { DatabaseSync } from "node:sqlite"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateSeedSql } from "./seed.mts"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoDir = resolve(packageDir, "..", "..")
const migrationsDir = join(packageDir, "drizzle")

const stringFlag = (name: string) =>
    process.argv
        .find((arg) => arg.startsWith(`--${name}=`))
        ?.slice(name.length + 3)

const flag = (name: string, fallback: number) => {
    const raw = stringFlag(name)
    const value = Number(raw ?? fallback)

    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback
}

const dir = stringFlag("dir")
const directory =
    dir === undefined
        ? undefined
        : isAbsolute(dir)
          ? dir
          : resolve(repoDir, dir)
const databasePath = stringFlag("db") ?? ":memory:"
const statementLimit = flag("limit", 0)

const rows = flag("rows", 2000)
const chunk = flag("chunk", 150)
const seed = flag("seed", 1)

if (databasePath !== ":memory:" && existsSync(databasePath)) {
    throw new Error(`Refusing to overwrite ${databasePath}; delete it first.`)
}

const database = new DatabaseSync(databasePath)

// 1. Schema — the same migrations Alchemy applies at deploy.
const migrations = readdirSync(migrationsDir)
    .filter((entry) => /^\d/.test(entry))
    .sort()

if (migrations.length === 0) {
    throw new Error(`No migrations found in ${migrationsDir}`)
}

/**
 * Splits a generated migration exactly the way D1 does.
 *
 * The `--> statement-breakpoint` marker is a *SQL comment*, so running a whole
 * file through `DatabaseSync#exec` silently succeeds on any SQLite build —
 * including one that rejects a statement D1 would refuse. D1 splits on the
 * marker and validates each statement on its own, so mirroring that split is
 * what makes this script able to catch a migration D1 would reject. It also
 * means each statement is validated independently rather than as one blob.
 */
const splitMigration = (sql: string): string[] =>
    sql
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0)

/**
 * Applies the migration chain.
 *
 * `through` is an inclusive upper bound and `after` an exclusive lower bound, so
 * the upgrade check can replay "old schema, then everything that came after it"
 * against a database that already holds data.
 */
const applyMigrations = (
    target: DatabaseSync,
    through?: string,
    after?: string,
): void => {
    for (const migration of migrations) {
        if (through !== undefined && migration > through) return
        if (after !== undefined && migration <= after) continue

        const file = join(migrationsDir, migration, "migration.sql")

        if (!existsSync(file)) continue

        for (const statement of splitMigration(readFileSync(file, "utf8"))) {
            target.exec(statement)
        }
    }
}

applyMigrations(database)

let statements = 0

if (directory === undefined) {
    database.exec("PRAGMA foreign_keys = ON")

    // 2a. Seed — a small, deterministic slice of the same generator the CLI uses.
    for (const statement of generateSeedSql({
        rows,
        chunk,
        seed,
        timestamp: Date.now(),
    })) {
        database.exec(statement)
        statements++
    }
} else {
    // 2b. Replay generated files. Foreign keys are checked once at the end so
    // the load can run inside a single transaction and in files that follow the
    // generator's parent-before-child ordering.
    const files = readdirSync(directory)
        .filter((entry) => entry.endsWith(".sql"))
        .sort()

    if (files.length === 0) {
        throw new Error(`No .sql files found in ${directory}`)
    }

    database.exec("PRAGMA foreign_keys = OFF")
    database.exec("BEGIN")

    for (const file of files) {
        const lines = createInterface({
            input: createReadStream(join(directory, file)),
            crlfDelay: Infinity,
        })
        let lineNumber = 0

        for await (const line of lines) {
            lineNumber++
            const statement = line.trim()

            if (statement.length === 0 || statement.startsWith("--")) continue

            try {
                database.exec(statement)
            } catch (error) {
                throw new Error(
                    `Failed in ${file}:${lineNumber}: ${
                        error instanceof Error ? error.message : String(error)
                    }\n${statement.slice(0, 300)}`,
                    { cause: error },
                )
            }

            statements++

            if (statementLimit > 0 && statements >= statementLimit) break
        }

        if (statementLimit > 0 && statements >= statementLimit) break
    }

    database.exec("COMMIT")
    database.exec("PRAGMA foreign_keys = ON")
}

database.exec("ANALYZE")

const scalar = (sql: string): number => {
    const row = database.prepare(sql).get() as
        | Record<string, unknown>
        | undefined

    return Number(row?.n ?? 0)
}

const plan = (sql: string): string =>
    (
        database.prepare(`EXPLAIN QUERY PLAN ${sql}`).all() as {
            detail?: unknown
        }[]
    )
        .map((row) => String(row.detail ?? ""))
        .join(" | ")

let failures = 0

const check = (label: string, actual: unknown, expected: unknown) => {
    const ok = actual === expected

    if (!ok) failures++
    console.log(
        `${ok ? "PASS" : "FAIL"} ${label}: ${String(actual)}${
            ok ? "" : ` (expected ${String(expected)})`
        }`,
    )
}

/**
 * 1b. The upgrade path, which the checks above cannot cover.
 *
 * Everything above starts from an empty database, so it only ever exercises the
 * `CREATE TABLE` route. A database that already ran the previous migrations
 * reaches the same schema through `ALTER TABLE ... ADD COLUMN`, and SQLite
 * refuses a non-constant default there ("Cannot add a column with non-constant
 * default") — the exact failure a real deploy hit. It also leaves the mirrored
 * lowercase columns at their default, which would make every existing row
 * unsearchable, so the backfill is asserted here too.
 */
if (directory === undefined && migrations.length > 1) {
    const upgrade = new DatabaseSync(":memory:")

    // The previous schema, with real rows in it.
    applyMigrations(upgrade, migrations[0])

    upgrade.exec(
        `INSERT INTO "BHClan" ("id", "name", "created", "xp")
         VALUES ('upgrade-clan', 'Upgrade Clan', 1, 1)`,
    )
    upgrade.exec(
        `INSERT INTO "BHPlayerAlias" ("playerId", "alias", "createdAt", "public")
         VALUES ('upgrade-1', 'Upgrade Player', 777, 1),
                ('upgrade-2', 'UPGRADE TWO', 888, 1)`,
    )

    // The rest of the chain, as D1 would replay it.
    applyMigrations(upgrade, undefined, migrations[0])

    const upgradeScalar = (sql: string): number =>
        Number(
            (upgrade.prepare(sql).get() as Record<string, unknown> | undefined)
                ?.n ?? 0,
        )

    console.log("\n-- upgrade path (previous schema + rows -> current)")
    // Reaching this line at all is the headline assertion: `applyMigrations`
    // above replays the chain statement by statement, so a non-constant default
    // (or any other statement D1 rejects) would have thrown before here.
    check(
        "upgraded table set",
        upgradeScalar(
            `SELECT count(*) AS n FROM sqlite_master
             WHERE type = 'table'
               AND name IN ('BHClan', 'BHPlayerAlias')`,
        ),
        2,
    )
    check(
        "upgraded clan names are searchable",
        upgradeScalar(
            `SELECT count(*) AS n FROM "BHClan"
             WHERE "nameLower" >= 'upgrade clan'
               AND "nameLower" < 'upgrade clao'`,
        ),
        1,
    )
    check(
        "upgraded aliases are searchable",
        upgradeScalar(
            `SELECT count(*) AS n FROM "BHPlayerAlias"
             WHERE "aliasLower" >= 'upgrade p'
               AND "aliasLower" < 'upgrade q'`,
        ),
        1,
    )
    check(
        "upgraded aliases are mirrored lowercase",
        upgradeScalar(
            `SELECT count(*) AS n FROM "BHPlayerAlias"
             WHERE "aliasLower" <> lower("alias")`,
        ),
        0,
    )
    check(
        "upgraded lastSeen is backfilled",
        upgradeScalar(
            `SELECT count(*) AS n FROM "BHPlayerAlias" WHERE "lastSeen" = 0`,
        ),
        0,
    )
    check(
        "old nocase indexes are dropped",
        upgradeScalar(
            `SELECT count(*) AS n FROM sqlite_master
             WHERE type = 'index'
               AND name IN ('BHClan_name_nocase_idx',
                            'BHPlayerAlias_alias_nocase_idx')`,
        ),
        0,
    )
}

const checkIndex = (label: string, sql: string, index: string) => {
    const detail = plan(sql)
    const ok = detail.includes(index)

    if (directory === undefined) {
        if (!ok) failures++
        console.log(`${ok ? "PASS" : "FAIL"} ${label} uses ${index}: ${detail}`)
    } else {
        // A small or partial import cannot prove planner behaviour, so report
        // the plan instead of failing: seed mode is where the index
        // assertions are meaningful.
        console.log(
            `INFO ${label} ${ok ? "uses" : "does NOT use"} ${index}: ${detail}`,
        )
    }
}

/** First characters of a real value, for a `LIKE 'x%'` plan check. */
const prefixOf = (table: string, column: string, length: number): string => {
    const row = database
        .prepare(
            `select substr("${column}", 1, ${length}) as p from "${table}" limit 1`,
        )
        .get() as { p?: unknown } | undefined

    return typeof row?.p === "string" && row.p.length > 0
        ? row.p.replace(/'/g, "''")
        : "zzz"
}

check("migrations applied", migrations.length > 0, true)
check("statements executed", statements > 0, true)

if (directory === undefined) {
    check(
        "BHClan rows",
        scalar(`select count(*) as n from "BHClan"`),
        Math.max(1, Math.floor(rows / 50)),
    )
    check(
        "BHPlayerData rows",
        scalar(`select count(*) as n from "BHPlayerData"`),
        rows,
    )
    check(
        "BHPlayerLegend rows",
        scalar(`select count(*) as n from "BHPlayerLegend"`),
        rows * 3,
    )
    check(
        "BHPlayerWeapon rows",
        scalar(`select count(*) as n from "BHPlayerWeapon"`),
        rows * 3,
    )
    check(
        "BHPlayerAlias rows",
        scalar(`select count(*) as n from "BHPlayerAlias"`),
        rows * 2,
    )
    check(
        "CrawlProgress rows",
        scalar(`select count(*) as n from "CrawlProgress"`),
        1,
    )
}

check(
    "foreign keys intact",
    (database.prepare("PRAGMA foreign_key_check").all() as unknown[]).length,
    0,
)

// 3. The hot read paths must be indexed, and the search queries must not fall
// back to a temp B-tree sort.
const aliasPrefix = prefixOf("BHPlayerAlias", "aliasLower", 3)
const clanPrefix = prefixOf("BHClan", "nameLower", 3)

checkIndex(
    "global rankings (ORDER BY xp)",
    `SELECT id, name, tier, rating, region, "peakRating", xp
     FROM "BHPlayerData" ORDER BY xp DESC LIMIT 50 OFFSET 0`,
    "BHPlayerData_xp_idx",
)

// The exact shape the alias search runs: filters and orders on `aliasLower`
// only. It must be an index *search* (a bounded range, not a full index walk)
// and it must avoid a temp B-tree, which is the difference between a bounded
// index walk and sorting every prefix match.
const aliasPlan = plan(
    `SELECT "playerId", alias FROM "BHPlayerAlias"
     WHERE "aliasLower" >= '${aliasPrefix}' AND "aliasLower" < '${aliasPrefix}\uFFFF'
       AND public = 1
     ORDER BY "aliasLower" LIMIT 50 OFFSET 0`,
)
check(
    "alias prefix search uses an index range",
    /SEARCH .* USING INDEX BHPlayerAlias_aliasLower_idx/.test(aliasPlan),
    true,
)
check(
    "alias search does not sort (no temp B-tree)",
    /TEMP B-TREE/i.test(aliasPlan),
    false,
)

const clanPlan = plan(
    `SELECT * FROM "BHClan"
     WHERE "nameLower" >= '${clanPrefix}' AND "nameLower" < '${clanPrefix}\uFFFF'
     ORDER BY "nameLower" LIMIT 50 OFFSET 0`,
)
check(
    "clan prefix search uses an index range",
    /SEARCH .* USING INDEX BHClan_nameLower_idx/.test(clanPlan),
    true,
)
check(
    "clan search does not sort (no temp B-tree)",
    /TEMP B-TREE/i.test(clanPlan),
    false,
)

// The `xp`-ranked clan listing (empty search box) keeps its own index.
checkIndex(
    "clan rankings (ORDER BY xp)",
    `SELECT * FROM "BHClan" ORDER BY xp DESC LIMIT 50 OFFSET 0`,
    "BHClan_xp_idx",
)

// The mirrored lowercase columns must actually be lowercase, or every prefix
// search silently misses: a name stored as "Clan 1" with "Clan 1" in
// `nameLower` would never match the needle "clan".
const aliasLowerMismatch = scalar(
    `SELECT count(*) as n FROM "BHPlayerAlias"
     WHERE "aliasLower" <> lower("alias")`,
)
check("BHPlayerAlias.aliasLower mirrors alias", aliasLowerMismatch, 0)

const clanLowerMismatch = scalar(
    `SELECT count(*) as n FROM "BHClan" WHERE "nameLower" <> lower("name")`,
)
check("BHClan.nameLower mirrors name", clanLowerMismatch, 0)

// The alias prefix index must exist even when a broad prefix makes the planner
// prefer another index.
const aliasIndexes = (
    database.prepare(`PRAGMA index_list('BHPlayerAlias')`).all() as {
        name?: unknown
    }[]
).map((row) => String(row.name ?? ""))

check(
    "BHPlayerAlias has the aliasLower index",
    aliasIndexes.includes("BHPlayerAlias_aliasLower_idx"),
    true,
)

const clanIndexes = (
    database.prepare(`PRAGMA index_list('BHClan')`).all() as {
        name?: unknown
    }[]
).map((row) => String(row.name ?? ""))

check(
    "BHClan has the nameLower index",
    clanIndexes.includes("BHClan_nameLower_idx"),
    true,
)

// 4. The grouped alias search (what `/api/effect/search/players` runs). Only
// meaningful for the synthetic seed, where the aliases are known.
if (directory === undefined) {
    const aliasRows = database
        .prepare(
            `SELECT * FROM "BHPlayerAlias"
             WHERE "playerId" IN (
                 SELECT "playerId" FROM "BHPlayerAlias"
                 WHERE "aliasLower" LIKE '${aliasPrefix}%' AND public = 1
                 ORDER BY "aliasLower" LIMIT 50 OFFSET 0
             )
             ORDER BY "playerId", "alias"`,
        )
        .all() as unknown[]

    check("grouped alias search returns rows", aliasRows.length > 0, true)
}

if (directory !== undefined) {
    console.log(`\n-- ${databasePath} row counts`)

    for (const table of [
        "UserProfile",
        "UserSession",
        "UserFavorite",
        "UserConnection",
        "BHClan",
        "BHPlayerData",
        "BHPlayerLegend",
        "BHPlayerWeapon",
        "BHPlayerAlias",
        "CrawlProgress",
    ]) {
        console.log(
            `   ${table}: ${scalar(
                `select count(*) as n from "${table}"`,
            ).toLocaleString("en-US")}`,
        )
    }
}

console.log(
    failures === 0
        ? directory === undefined
            ? `\nSchema + seed verified in local SQLite (${rows} players).`
            : `\nSchema + import verified in local SQLite (${statements.toLocaleString(
                  "en-US",
              )} statements from ${directory}).`
        : `\n${failures} check(s) failed.`,
)

process.exit(failures === 0 ? 0 : 1)
