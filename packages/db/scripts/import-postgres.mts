#!/usr/bin/env node
/**
 * One-off Postgres → D1 SQL export. Read-only; writes chunked `.sql` files.
 * Preserves `UserProfile.id` and backfills Discord identity so returning users
 * keep favourites. Does not copy `UserSession`. Parses URLs by hand so passwords
 * with `#`/`@` work.
 */
import { createWriteStream, statSync, type WriteStream } from "node:fs"
import { mkdir } from "node:fs/promises"
import { once } from "node:events"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"
import { insertStatements, type Sql } from "./sql.mts"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoDir = resolve(packageDir, "..", "..")

/** Resolve paths against the repo root (pnpm cwd is packages/db). */
const repoPath = (value: string) =>
    isAbsolute(value) ? value : resolve(repoDir, value)

type SourceRow = Record<string, unknown>

type Column = {
    readonly name: string
    /** Overrides the default `"name"` select expression. */
    readonly expr?: string
}

type TableSpec = {
    readonly table: string
    /** `FROM` clause (may join). */
    readonly source: string
    readonly columns: readonly Column[]
    /**
     * Keyset pagination keys. `cast` is required — proxy/pooler type inference
     * is unreliable.
     */
    readonly order: readonly {
        readonly expr: string
        readonly key: string
        readonly cast?: "text" | "uuid" | "int4"
    }[]
}

const col = (name: string): Column => ({ name })

/**
 * Naive `timestamp` holding UTC wall time → epoch ms. Never let `pg` parse as
 * server-local.
 */
const ts = (name: string): Column => ({
    name,
    expr: `(extract(epoch from "${name}" AT TIME ZONE 'UTC') * 1000)::double precision`,
})

/** `auth.users.created_at` is `timestamptz` — no `AT TIME ZONE`. */
const AUTH_CREATED_AT: Column = {
    name: "createdAt",
    expr: `(extract(epoch from u.created_at) * 1000)::double precision`,
}

/**
 * JS `toLowerCase()` mirror via Postgres `lower()`; can differ for a few
 * characters (e.g. `İ`) — re-derive in Node if search misses.
 */
const derivedLower = (name: string, expr: string): Column => ({
    name,
    expr: `lower(${expr})`,
})

/** `UserProfile` needs `auth`; plain Postgres gets the fallback. */
const userProfileColumns = (hasAuth: boolean): readonly Column[] =>
    hasAuth
        ? [
              // Qualify `id`: both `auth.users` and `auth.identities` have one.
              { name: "id", expr: `p."id"` },
              {
                  name: "discordId",
                  expr: `i.identity_data ->> 'sub'`,
              },
              {
                  name: "username",
                  expr: `coalesce(nullif(p.username, ''), u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')`,
              },
              { name: "avatarUrl", expr: `p."avatarUrl"` },
              { name: "email", expr: `u.email` },
              AUTH_CREATED_AT,
          ]
        : [
              { name: "id", expr: `p."id"` },
              { name: "discordId", expr: `NULL` },
              { name: "username", expr: `p."username"` },
              { name: "avatarUrl", expr: `p."avatarUrl"` },
              { name: "email", expr: `NULL` },
              {
                  name: "createdAt",
                  expr: `(extract(epoch from now()) * 1000)::double precision`,
              },
          ]

const userProfileSource = (hasAuth: boolean): string =>
    hasAuth
        ? `public."UserProfile" AS p
             LEFT JOIN auth.users AS u ON u.id = p.id
             LEFT JOIN auth.identities AS i ON i.user_id = p.id AND i.provider = 'discord'`
        : `public."UserProfile" AS p`

const specs = (hasAuth: boolean): readonly TableSpec[] => [
    {
        table: "UserProfile",
        source: userProfileSource(hasAuth),
        columns: userProfileColumns(hasAuth),
        order: [{ expr: `p."id"`, key: "id", cast: "uuid" }],
    },
    {
        table: "UserFavorite",
        source: `public."UserFavorite"`,
        columns: [
            col("type"),
            col("id"),
            col("name"),
            col("meta"),
            col("userId"),
        ],
        order: [
            { expr: `"userId"`, key: "userId", cast: "uuid" },
            { expr: `"type"`, key: "type" },
            { expr: `"id"`, key: "id" },
        ],
    },
    {
        table: "UserConnection",
        source: `public."UserConnection"`,
        columns: [
            col("userId"),
            col("type"),
            col("appId"),
            col("name"),
            col("verified"),
            col("public"),
        ],
        order: [
            { expr: `"userId"`, key: "userId", cast: "uuid" },
            { expr: `"type"`, key: "type" },
            { expr: `"appId"`, key: "appId" },
        ],
    },
    {
        table: "BHClan",
        source: `public."BHClan"`,
        columns: [
            col("id"),
            col("name"),
            derivedLower("nameLower", `"name"`),
            col("created"),
            col("xp"),
        ],
        order: [{ expr: `"id"`, key: "id" }],
    },
    {
        table: "BHPlayerData",
        source: `public."BHPlayerData"`,
        columns: [
            col("id"),
            col("name"),
            ts("lastUpdated"),
            col("xp"),
            col("level"),
            col("tier"),
            col("games"),
            col("wins"),
            col("rating"),
            col("peakRating"),
            col("rankedGames"),
            col("rankedWins"),
            col("region"),
            col("damageDealt"),
            col("damageTaken"),
            col("kos"),
            col("falls"),
            col("suicides"),
            col("teamKos"),
            col("matchTime"),
            col("damageUnarmed"),
            col("koUnarmed"),
            col("matchTimeUnarmed"),
            col("koThrownItem"),
            col("damageThrownItem"),
            col("koGadgets"),
            col("damageGadgets"),
        ],
        order: [{ expr: `"id"`, key: "id" }],
    },
    {
        table: "BHPlayerLegend",
        source: `public."BHPlayerLegend"`,
        columns: [
            col("player_id"),
            ts("lastUpdated"),
            col("legend_id"),
            col("damageDealt"),
            col("damageTaken"),
            col("kos"),
            col("falls"),
            col("suicides"),
            col("teamKos"),
            col("matchTime"),
            col("games"),
            col("wins"),
            col("damageUnarmed"),
            col("damageThrownItem"),
            col("damageWeaponOne"),
            col("damageWeaponTwo"),
            col("damageGadgets"),
            col("koUnarmed"),
            col("koThrownItem"),
            col("koWeaponOne"),
            col("koWeaponTwo"),
            col("koGadgets"),
            col("timeHeldWeaponOne"),
            col("timeHeldWeaponTwo"),
            col("xp"),
            col("level"),
        ],
        order: [
            { expr: `"player_id"`, key: "player_id" },
            { expr: `"legend_id"`, key: "legend_id", cast: "int4" },
        ],
    },
    {
        table: "BHPlayerWeapon",
        source: `public."BHPlayerWeapon"`,
        columns: [
            col("player_id"),
            ts("lastUpdated"),
            col("weapon_name"),
            col("kos"),
            col("matchTime"),
            col("games"),
            col("wins"),
            col("damageDealt"),
            col("xp"),
            col("level"),
        ],
        order: [
            { expr: `"player_id"`, key: "player_id" },
            { expr: `"weapon_name"`, key: "weapon_name" },
        ],
    },
    {
        table: "BHPlayerAlias",
        // Drop empty/zero owners and blank aliases in FROM (not WHERE) so keyset
        // pagination stays on the bare (playerId, alias) order. NULLIF catches
        // NULL that `<> '0'` would miss; btrim drops whitespace-only aliases.
        source: `(SELECT * FROM public."BHPlayerAlias"
                  WHERE NULLIF("playerId", '') IS NOT NULL
                    AND "playerId" <> '0'
                    AND btrim("alias") <> '') AS "BHPlayerAlias"`,
        columns: [
            col("playerId"),
            col("alias"),
            derivedLower("aliasLower", `"alias"`),
            ts("createdAt"),
            // Old schema had no lastSeen — seed from createdAt, not "now".
            { ...ts("createdAt"), name: "lastSeen" },
            col("public"),
        ],
        order: [
            { expr: `"playerId"`, key: "playerId" },
            { expr: `"alias"`, key: "alias" },
        ],
    },
    {
        table: "CrawlProgress",
        source: `public."CrawlProgress"`,
        columns: [col("id"), col("name"), ts("lastUpdated"), col("progress")],
        order: [{ expr: `"id"`, key: "id" }],
    },
]

/** Postgres value -> SQLite literal. Dates must already be epoch numbers. */
const encode = (value: unknown): Sql => {
    if (value === null || value === undefined) return null
    if (typeof value === "boolean") return value ? 1 : 0
    if (typeof value === "bigint") return Number(value)
    if (typeof value === "number") return Number.isFinite(value) ? value : null
    // `jsonb` arrives parsed (UserFavorite.meta).
    if (typeof value === "object") return JSON.stringify(value)

    return String(value)
}

const selectList = (spec: TableSpec): string =>
    spec.columns
        .map((column) =>
            column.expr === undefined
                ? `"${column.name}"`
                : `${column.expr} AS "${column.name}"`,
        )
        .join(", ")

/**
 * Inline LIMIT and explicit cursor casts — poolers often skip type inference.
 */
const pageQuery = (
    spec: TableSpec,
    chunk: number,
    cursor: readonly Sql[] | undefined,
) => {
    const order = spec.order.map((key) => key.expr).join(", ")
    const placeholders = spec.order.map(
        (key, index) => `$${index + 1}::${key.cast ?? "text"}`,
    )
    const values: unknown[] = cursor ? [...cursor] : []

    return {
        text:
            `SELECT ${selectList(spec)} FROM ${spec.source}` +
            (cursor ? ` WHERE (${order}) > (${placeholders.join(", ")})` : "") +
            ` ORDER BY ${order} LIMIT ${chunk}`,
        values,
    }
}

type Progress = (table: string, rows: number) => void

type Query = (config: {
    readonly text: string
    readonly values: readonly unknown[]
}) => Promise<{ readonly rows: SourceRow[] }>

/** Keyset pagination (never OFFSET) so large tables do not grow a sort prefix. */
async function* exportTable(
    query: Query,
    spec: TableSpec,
    options: {
        readonly chunk: number
        readonly maxStatementBytes: number
        readonly limit: number
        readonly onProgress: Progress
    },
): AsyncGenerator<string> {
    const columns = spec.columns.map((column) => column.name)
    let cursor: Sql[] | undefined
    let rowsRead = 0

    for (;;) {
        const limit =
            options.limit > 0
                ? Math.min(options.chunk, options.limit - rowsRead)
                : options.chunk

        if (limit <= 0) return

        const { text, values } = pageQuery(spec, limit, cursor)
        const result = await query({ text, values })

        if (result.rows.length === 0) return

        const encoded = result.rows.map((row) =>
            spec.columns.map((column) => encode(row[column.name])),
        )

        for (const statement of insertStatements(spec.table, columns, encoded, {
            rows: options.chunk,
            bytes: options.maxStatementBytes,
        })) {
            yield statement
        }

        rowsRead += result.rows.length
        options.onProgress(spec.table, rowsRead)

        const last = result.rows[result.rows.length - 1]

        if (last === undefined) return

        cursor = spec.order.map((key) => encode(last[key.key]))

        if (result.rows.length < limit) return
    }
}

/** Numbered, size-bounded output files. */
class SqlFileWriter {
    readonly files: string[] = []
    statements = 0
    bytes = 0

    readonly #directory: string
    readonly #prefix: string
    readonly #maxBytes: number
    #stream: WriteStream | undefined
    #fileBytes = 0
    #index = 0

    constructor(directory: string, prefix: string, maxBytes: number) {
        this.#directory = directory
        this.#prefix = prefix
        this.#maxBytes = maxBytes
    }

    async write(statement: string): Promise<void> {
        const line = `${statement}\n`

        if (
            this.#stream === undefined ||
            (this.#fileBytes > 0 &&
                this.#fileBytes + line.length > this.#maxBytes)
        ) {
            await this.close()
            await this.#open()
        }

        const stream = this.#stream

        if (stream === undefined) throw new Error("writer is not open")

        if (!stream.write(line)) await once(stream, "drain")

        this.#fileBytes += line.length
        this.bytes += line.length
        this.statements += 1
    }

    async close(): Promise<void> {
        const stream = this.#stream

        if (stream === undefined) return

        this.#stream = undefined

        await new Promise<void>((done) => stream.end(done))
    }

    async #open(): Promise<void> {
        this.#index += 1

        const name = `${this.#prefix}${String(this.#index).padStart(4, "0")}.sql`
        const stream = createWriteStream(join(this.#directory, name))

        await once(stream, "open")

        this.files.push(name)
        this.#stream = stream
        this.#fileBytes = 0
    }
}

type CliOptions = {
    readonly source: string
    readonly out: string
    readonly chunk: number
    readonly maxBytes: number
    readonly maxStatementBytes: number
    readonly only: readonly string[] | undefined
    readonly limit: number
    readonly ssl: "auto" | "require" | "verify" | "disable"
}

export type SourceConnection = {
    readonly host: string
    readonly port: number
    readonly user: string | undefined
    readonly password: string | undefined
    readonly database: string | undefined
    readonly sslmode: string | undefined
}

const decodePart = (value: string): string => {
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

const isLocalHost = (host: string): boolean =>
    host === "localhost" || host === "127.0.0.1" || host === "::1"

const parsePort = (value: string): number => {
    const port = Number(value)

    if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
        throw new Error(`Invalid port "${value}" in the source URL.`)
    }

    return port
}

/**
 * Without `new URL` — `pg` rejects `#` in passwords and unreplaced `[region]`
 * placeholders. Authority split accepts raw specials; user/password decode.
 */
export const parseSource = (raw: string): SourceConnection => {
    const trimmed = raw
        .trim()
        .replace(/^(['"])([\s\S]*)\1$/, "$2")
        .trim()

    if (trimmed.length === 0) {
        throw new Error(
            "Missing source database. Pass --source=postgres://... or set SOURCE_DATABASE_URL.",
        )
    }

    if (/YOUR[-_ ]?PASSWORD|<password>|<pw>/i.test(trimmed)) {
        throw new Error(
            "The source URL still contains a password placeholder.\n" +
                "Replace it with the real database password (or the URL-encoded " +
                "form: @ -> %40, # -> %23, / -> %2F, ? -> %3F, : -> %3A).",
        )
    }

    const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//.exec(trimmed)

    if (scheme === null) {
        throw new Error(
            "The source is not a Postgres URL. Expected " +
                '"postgres://user:password@host:5432/database".',
        )
    }

    const protocol = (scheme[1] ?? "").toLowerCase()

    if (protocol !== "postgres" && protocol !== "postgresql") {
        throw new Error(
            protocol === "http" || protocol === "https"
                ? "That is the Supabase API URL, not the database connection " +
                      "string. In the Supabase dashboard open Connect -> Session " +
                      "pooler and copy the postgres:// URI."
                : `Unsupported scheme "${protocol}://" — expected postgres://.`,
        )
    }

    const rest = trimmed.slice(scheme[0].length)
    // Last `@` separates credentials from host — password may contain `@`.
    const at = rest.lastIndexOf("@")
    const userinfo = at === -1 ? undefined : rest.slice(0, at)
    let hostPart = at === -1 ? rest : rest.slice(at + 1)

    const queryStart = hostPart.indexOf("?")
    const fragmentStart = hostPart.indexOf("#")
    const paramsStart = [queryStart, fragmentStart]
        .filter((index) => index !== -1)
        .reduce((min, index) => Math.min(min, index), Number.POSITIVE_INFINITY)
    const query =
        paramsStart === Number.POSITIVE_INFINITY
            ? ""
            : hostPart.slice(paramsStart + 1)

    if (paramsStart !== Number.POSITIVE_INFINITY) {
        hostPart = hostPart.slice(0, paramsStart)
    }

    const slash = hostPart.indexOf("/")
    const hostPort = slash === -1 ? hostPart : hostPart.slice(0, slash)
    const database =
        slash === -1
            ? undefined
            : decodePart(hostPart.slice(slash + 1)) || undefined

    const brackets = hostPort.indexOf("[")

    if (brackets !== -1 && !hostPort.startsWith("[")) {
        throw new Error(
            `The host "${hostPort}" still contains a placeholder. Replace ` +
                "[region] / [project-ref] with the real Supabase values.",
        )
    }

    let host: string
    let port = 5432

    if (hostPort.startsWith("[")) {
        const end = hostPort.indexOf("]")

        if (end === -1) {
            throw new Error(`Unterminated IPv6 host "${hostPort}".`)
        }

        host = hostPort.slice(1, end)
        const rest = hostPort.slice(end + 1)

        if (rest.startsWith(":")) port = parsePort(rest.slice(1))
    } else {
        const colon = hostPort.lastIndexOf(":")

        if (colon !== -1 && /^\d+$/.test(hostPort.slice(colon + 1))) {
            host = hostPort.slice(0, colon)
            port = parsePort(hostPort.slice(colon + 1))
        } else {
            host = hostPort
        }
    }

    if (host.length === 0) {
        throw new Error(
            "The source URL has no host. Expected " +
                '"postgres://user:password@host:5432/database".',
        )
    }

    let user: string | undefined
    let password: string | undefined

    if (userinfo !== undefined && userinfo.length > 0) {
        const colon = userinfo.indexOf(":")

        if (colon === -1) {
            user = decodePart(userinfo)
        } else {
            user = decodePart(userinfo.slice(0, colon))
            password = decodePart(userinfo.slice(colon + 1))
        }
    }

    const sslmode =
        new URLSearchParams(query).get("sslmode")?.toLowerCase() ?? undefined

    return { host, port, user, password, database, sslmode }
}

const sslFromMode = (
    mode: string | undefined,
): false | { rejectUnauthorized: boolean } | undefined => {
    switch (mode) {
        case "disable":
        case "allow":
            return false
        case "prefer":
        case "require":
            return { rejectUnauthorized: false }
        case "verify-ca":
        case "verify-full":
            return { rejectUnauthorized: true }
        default:
            return undefined
    }
}

const sslConfig = (
    option: CliOptions["ssl"],
    connection: SourceConnection,
): false | { rejectUnauthorized: boolean } => {
    if (option !== "auto") {
        return option === "disable"
            ? false
            : { rejectUnauthorized: option === "verify" }
    }

    const fromUrl = sslFromMode(connection.sslmode)

    if (fromUrl !== undefined) return fromUrl

    // Cloud Postgres (Supabase included) requires TLS; a local server does not.
    return isLocalHost(connection.host) ? false : { rejectUnauthorized: false }
}

const parseArgs = (argv: readonly string[]): CliOptions => {
    const flag = (name: string) =>
        argv
            .find((argument) => argument.startsWith(`--${name}=`))
            ?.slice(name.length + 3)

    const number = (name: string, fallback: number) => {
        const value = Number(flag(name) ?? fallback)

        return Number.isFinite(value) && value >= 0
            ? Math.floor(value)
            : fallback
    }

    const source = flag("source") ?? process.env["SOURCE_DATABASE_URL"]

    if (!source) {
        throw new Error(
            "Missing source database. Pass --source=postgres://... or set SOURCE_DATABASE_URL.",
        )
    }

    const ssl = flag("ssl") ?? "auto"

    if (
        ssl !== "auto" &&
        ssl !== "require" &&
        ssl !== "verify" &&
        ssl !== "disable"
    ) {
        throw new Error(
            `Invalid --ssl=${ssl} (expected auto, require, verify or disable).`,
        )
    }

    const only = flag("only")
        ?.split(",")
        .map((table) => table.trim())
        .filter((table) => table.length > 0)

    return {
        source,
        out: repoPath(flag("out") ?? "packages/db/seed/generated/supabase"),
        // SELECT page size only — statements are byte-split separately.
        chunk: Math.max(1, number("chunk", 5_000)),
        maxBytes: Math.max(1024, number("max-bytes", 200_000_000)),
        maxStatementBytes: number("max-statement-bytes", 90_000),
        only: only && only.length > 0 ? only : undefined,
        limit: number("limit", 0),
        ssl,
    }
}

const fail = (message: string): never => {
    console.error(`\n${message}`)
    process.exit(1)
}

type ClientConfig = ConstructorParameters<typeof pg.Client>[0]

const CONNECTION_ERROR_CODES = new Set([
    "ECONNRESET",
    "ECONNREFUSED",
    "EPIPE",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ENOTFOUND",
    "08000",
    "08001",
    "08003",
    "08004",
    "08006",
    "53300",
    "57P01",
    "57P02",
    "57P03",
])

const isConnectionError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false

    const code = (error as { code?: unknown }).code

    if (typeof code === "string" && CONNECTION_ERROR_CODES.has(code))
        return true

    if (code === "57014" || code === "QUERY_TIMEOUT") return true

    return /connection (terminated|closed|ended)|socket hang up|connection error|already been closed|query read timeout|not queryable/i.test(
        error.message,
    )
}

const MAX_RECONNECTS = 10

/**
 * Survives pooler session drops: replace client and retry the current page.
 * Keyset only advances after a write, so retries cannot duplicate rows.
 */
class Source {
    readonly #config: ClientConfig
    #client: pg.Client
    #broken = false

    constructor(config: ClientConfig) {
        this.#config = config
        this.#client = this.#spawn()
    }

    #spawn(): pg.Client {
        const client = new pg.Client(this.#config)

        // Without listeners Node throws the `error` event outright.
        client.on("error", () => {
            this.#broken = true
        })
        client.on("end", () => {
            this.#broken = true
        })

        return client
    }

    async open(): Promise<void> {
        await this.#client.connect()
    }

    async query<R extends Record<string, unknown>>(config: {
        readonly text: string
        readonly values?: readonly unknown[]
    }): Promise<{ rows: R[] }> {
        let lastError: unknown

        for (let attempt = 0; attempt <= MAX_RECONNECTS; attempt++) {
            if (this.#broken) {
                const message =
                    lastError instanceof Error
                        ? lastError.message
                        : String(lastError)

                console.warn(
                    `\nConnection lost (${message}); reconnecting ` +
                        `(${attempt}/${MAX_RECONNECTS}) ...`,
                )

                await this.#reconnect(attempt)
            }

            try {
                const result = await this.#client.query<R>({
                    text: config.text,
                    values: config.values ? [...config.values] : undefined,
                })

                return { rows: result.rows }
            } catch (error) {
                lastError = error

                if (!this.#broken && !isConnectionError(error)) throw error

                this.#broken = true
            }
        }

        throw lastError
    }

    async #reconnect(attempt: number): Promise<void> {
        // Detach first so dying client's `end` does not re-mark the replacement.
        this.#client.removeAllListeners("error")
        this.#client.removeAllListeners("end")

        try {
            await this.#client.end()
        } catch {
            // Socket already gone.
        }

        await new Promise((done) =>
            setTimeout(done, Math.min(2 ** attempt * 500, 15_000)),
        )

        this.#client = this.#spawn()

        await this.#client.connect()

        this.#broken = false
    }

    async close(): Promise<void> {
        this.#client.removeAllListeners("error")
        this.#client.removeAllListeners("end")

        try {
            await this.#client.end()
        } catch {
            // Already closed.
        }
    }
}

/** Warn on the two detectable Supabase connection mistakes. */
const warnAboutConnection = (connection: SourceConnection): void => {
    if (
        connection.host.startsWith("db.") &&
        connection.host.endsWith(".supabase.co")
    ) {
        console.warn(
            "Warning: direct Supabase connections (db.<ref>.supabase.co) are " +
                "IPv6-only. Use the session pooler instead: " +
                "aws-0-<region>.pooler.supabase.com:5432.",
        )
    }

    if (connection.port === 6543) {
        console.warn(
            "Warning: port 6543 is the transaction pooler, which has no session " +
                "state. Prefer the session pooler on 5432.",
        )
    }
}

const main = async () => {
    const options = parseArgs(process.argv.slice(2))
    const connection = parseSource(options.source)
    const ssl = sslConfig(options.ssl, connection)

    warnAboutConnection(connection)

    const source = new Source({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
        ssl,
        keepAlive: true,
        connectionTimeoutMillis: 30_000,
        // Bound hung reads; timed-out SELECT is retried above.
        query_timeout: 600_000,
        application_name: "corehalla-d1-import",
        // Read-only session — this generator never writes.
        options: "-c default_transaction_read_only=on",
    })

    console.log(
        `Connecting to ${connection.user ?? "postgres"}@${connection.host}:${
            connection.port
        }/${connection.database ?? ""} (ssl ${
            ssl === false
                ? "off"
                : ssl.rejectUnauthorized
                  ? "verify"
                  : "require"
        }) ...`,
    )

    try {
        await source.open()
    } catch (error) {
        fail(
            `Could not connect to the source database: ${
                error instanceof Error ? error.message : String(error)
            }`,
        )
    }

    const query: Query = (config) => source.query<SourceRow>(config)

    try {
        const auth = await source.query<{
            has_users: boolean
            has_identities: boolean
        }>({
            text: `select to_regclass('auth.users') is not null as has_users,
                    to_regclass('auth.identities') is not null as has_identities`,
        })
        const hasAuth =
            auth.rows[0]?.has_users === true &&
            auth.rows[0]?.has_identities === true

        if (!hasAuth) {
            console.warn(
                "Warning: auth.users/auth.identities not found — discordId and email " +
                    "cannot be backfilled and will be NULL (plain Postgres source?).",
            )
        }

        const all = specs(hasAuth)
        const selected =
            options.only === undefined
                ? all
                : all.filter((spec) => options.only?.includes(spec.table))

        if (options.only !== undefined) {
            const unknown = options.only.filter(
                (table) => !all.some((spec) => spec.table === table),
            )

            if (unknown.length > 0) {
                fail(
                    `Unknown --only table(s): ${unknown.join(", ")}. ` +
                        `Known: ${all.map((spec) => spec.table).join(", ")}.`,
                )
            }
        }

        const present = await source.query<{ table_name: string }>({
            text: `select table_name from information_schema.tables where table_schema = 'public'`,
        })
        const presentTables = new Set(present.rows.map((row) => row.table_name))
        const missing = selected
            .map((spec) => spec.table)
            .filter((table) => !presentTables.has(table))

        if (missing.length > 0) {
            fail(
                `Source database is missing table(s): ${missing.join(", ")}. ` +
                    "Point --source at the old Corehalla database.",
            )
        }

        await mkdir(options.out, { recursive: true })

        const writer = new SqlFileWriter(options.out, "", options.maxBytes)
        let lastTable = ""

        for (const spec of selected) {
            const before = writer.statements
            const onProgress: Progress = (table, rows) => {
                if (table !== lastTable || rows % 250_000 === 0) {
                    lastTable = table
                    console.log(
                        `  ${table}: ${rows.toLocaleString("en-US")} rows ...`,
                    )
                }
            }

            for await (const statement of exportTable(query, spec, {
                chunk: options.chunk,
                maxStatementBytes: options.maxStatementBytes,
                limit: options.limit,
                onProgress,
            })) {
                await writer.write(statement)
            }

            console.log(
                `  ${spec.table}: done (${writer.statements - before} statements).`,
            )
        }

        await writer.close()

        const sizes = writer.files.map((file) => ({
            file,
            bytes: statSync(join(options.out, file)).size,
        }))
        const total = sizes.reduce((sum, entry) => sum + entry.bytes, 0)

        console.log(
            `\nWrote ${writer.statements.toLocaleString("en-US")} statements to ` +
                `${writer.files.length} file(s) in ${options.out} (${(total / 1e6).toFixed(1)} MB).`,
        )
        for (const entry of sizes) {
            console.log(`  ${entry.file}  ${(entry.bytes / 1e6).toFixed(1)} MB`)
        }

        console.log(`
Next steps:

1. Validate offline against the real schema (no D1, no billing):
     pnpm db:seed:verify -- --dir=${relative(repoDir, options.out)}

2. Import once, remotely. Either let Alchemy ingest the files above
   (the root alchemy.run.ts attaches this directory to \`importFiles\` when the flag
   is set, and Cloudflare applies them in order):

     IMPORT_SUPABASE_SEED=1 pnpm deploy

   ... or loop wrangler (paths are relative to the repo root):

     for f in ${relative(repoDir, options.out)}/*.sql; do
         pnpm dlx wrangler d1 execute corehalla --remote --file="$f" --yes
     done

3. Check the result:
     pnpm dlx wrangler d1 info corehalla
     pnpm dlx wrangler d1 execute corehalla --remote \\
         --command 'select count(*) from "BHPlayerData"'
`)
    } finally {
        await source.close()
    }
}

const isMain =
    process.argv[1] !== undefined &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
    await main().catch((error: unknown) => {
        console.error(
            `\n${error instanceof Error ? error.message : String(error)}`,
        )
        process.exit(1)
    })
}
