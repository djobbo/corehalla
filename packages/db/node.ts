import * as D1Client from "@effect/sql-d1/D1Client"
import { makeWithDefaults } from "drizzle-orm/effect-d1"
import { Context, Layer, ManagedRuntime } from "effect"
import type { Effect } from "effect"
import type { EffectSQLiteD1Database } from "drizzle-orm/effect-d1"

/**
 * D1 over HTTP for the Node crawler (no Worker `DB` binding). Same Effect SQL +
 * Drizzle stack as `db/client.ts`. Needs CLOUDFLARE_ACCOUNT_ID,
 * CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.
 */

export type D1HttpConfig = {
    readonly accountId: string
    readonly databaseId: string
    readonly apiToken: string
    readonly baseUrl?: string
}

const DEFAULT_BASE_URL = "https://api.cloudflare.com/client/v4"

type D1QueryResponse = {
    readonly success: boolean
    readonly errors?: readonly unknown[]
    readonly result?: readonly {
        readonly results?: readonly Record<string, unknown>[]
    }[]
}

const readConfig = (config?: Partial<D1HttpConfig>): D1HttpConfig => {
    const accountId = config?.accountId ?? process.env.CLOUDFLARE_ACCOUNT_ID
    const databaseId =
        config?.databaseId ?? process.env.CLOUDFLARE_D1_DATABASE_ID
    const apiToken = config?.apiToken ?? process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !databaseId || !apiToken) {
        throw new Error(
            "Cloudflare D1 HTTP access requires CLOUDFLARE_ACCOUNT_ID, " +
                "CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_API_TOKEN.",
        )
    }

    return {
        accountId,
        databaseId,
        apiToken,
        baseUrl: config?.baseUrl ?? process.env.CLOUDFLARE_API_BASE_URL,
    }
}

const query = async (
    config: D1HttpConfig,
    sql: string,
    params: readonly unknown[],
) => {
    const response = await fetch(
        `${config.baseUrl ?? DEFAULT_BASE_URL}/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql, params }),
        },
    )

    if (!response.ok) {
        throw new Error(
            `D1 HTTP query failed (${response.status}): ${await response.text()}`,
        )
    }

    const body = (await response.json()) as D1QueryResponse

    if (!body.success) {
        throw new Error(
            `D1 HTTP query failed: ${JSON.stringify(body.errors ?? [])}`,
        )
    }

    return body.result?.[0]?.results ?? []
}

type RestStatement = {
    readonly bind: (...params: unknown[]) => RestStatement
    readonly all: () => Promise<{
        results: Record<string, unknown>[]
        success: boolean
        meta: Record<string, unknown>
    }>
    readonly raw: () => Promise<unknown[][]>
    readonly run: () => Promise<{
        results: never[]
        success: boolean
        meta: Record<string, unknown>
    }>
    readonly first: (column?: string) => Promise<unknown>
}

const makeStatement = (
    config: D1HttpConfig,
    sql: string,
    params: readonly unknown[] = [],
): RestStatement => ({
    bind: (...next) => makeStatement(config, sql, next),
    all: async () => ({
        results: [...(await query(config, sql, params))],
        success: true,
        meta: {},
    }),
    raw: async () =>
        (await query(config, sql, params)).map((row) => Object.values(row)),
    async run() {
        await query(config, sql, params)
        return { results: [], success: true, meta: {} }
    },
    async first(column?: string) {
        const row = (await query(config, sql, params))[0]

        return column ? row?.[column] : row
    },
})

/**
 * `D1Database`-shaped REST adapter. `@effect/sql-d1` needs prepare/bind/all/raw
 * and batch; `dump` is unsupported over HTTP.
 */
const makeDatabase = (config: D1HttpConfig): D1Client.D1ClientConfig["db"] =>
    ({
        prepare: (sql: string) => makeStatement(config, sql),
        batch: async (statements: RestStatement[]) =>
            Promise.all(statements.map((statement) => statement.all())),
        async exec(sql: string) {
            await query(config, sql, [])
            return { count: 0, duration: 0 }
        },
        async dump() {
            throw new Error("D1 dump is not supported over the HTTP API")
        },
    }) as unknown as D1Client.D1ClientConfig["db"]

export type SqlDatabase = EffectSQLiteD1Database & {
    readonly $client: D1Client.D1Client
}

export class Database extends Context.Service<Database, SqlDatabase>()(
    "db/NodeDatabase",
) {}

export const layer = (config?: Partial<D1HttpConfig>) =>
    Layer.effect(Database, makeWithDefaults({})).pipe(
        Layer.provide(
            D1Client.layer({
                db: makeDatabase(readConfig(config)),
            }),
        ),
    )

let runtime: ManagedRuntime.ManagedRuntime<Database, unknown> | undefined

/** Process-wide handle for long-lived Node; serverless builds its own layer. */
export const runDatabase = <A, E>(
    effect: Effect.Effect<A, E, Database>,
    config?: Partial<D1HttpConfig>,
): Promise<A> => {
    if (!runtime) {
        runtime = ManagedRuntime.make(
            layer(config),
        ) as ManagedRuntime.ManagedRuntime<Database, unknown>
    }

    return runtime.runPromise(effect)
}

export const disposeDatabase = async () => {
    if (runtime) {
        await runtime.dispose()
        runtime = undefined
    }
}
