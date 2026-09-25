import { and, eq, sql } from "db/query"
import { Context, Effect, Layer, Option } from "effect"
import { Database as SqlDatabase } from "db/client"
import {
    userConnection,
    userFavorite,
    userProfile,
    userSession,
} from "db/schema"
import { discordConfig } from "./config"
import { SESSION_COOKIE, randomToken, readCookie, sha256Hex } from "./cookies"
import { fetchDiscordConnections, refreshDiscordToken } from "./discord"
import { AuthError } from "./errors"
import type {
    JsonValue,
    UserConnection,
    UserFavorite,
    UserProfile,
} from "db/schema"

/**
 * App-owned authentication.
 *
 * Supabase Auth used to own identity and hand the browser a JWT plus the
 * Discord provider token. Here the tokens stay on the server: the browser
 * holds one opaque session cookie, `UserSession.id` is its SHA-256 digest, and
 * the Discord access/refresh tokens live in the same row. Every read or write
 * is scoped by the `userId` this service resolves from the cookie.
 */

export type AuthSession = {
    readonly user: UserProfile
    readonly discordAccessToken: string
    readonly sessionId: string
    readonly expiresAt: Date
}

export type FavoriteInput = {
    readonly id: string
    readonly type: string
    readonly name: string
    readonly meta: JsonValue
}

/** 30 days; the Discord token inside is refreshed as needed. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
/** Refresh the Discord token this long before it actually expires. */
const REFRESH_MARGIN_MS = 60_000

export class Auth extends Context.Service<
    Auth,
    {
        getSession: (
            headers: Headers,
        ) => Effect.Effect<AuthSession | null, AuthError>
        createSession: (input: {
            userId: string
            accessToken: string
            refreshToken: string | null
            expiresIn: number
            scope: string
        }) => Effect.Effect<
            { readonly token: string; readonly expiresAt: Date },
            AuthError
        >
        deleteSession: (headers: Headers) => Effect.Effect<void, AuthError>
        upsertDiscordUser: (input: {
            discordId: string
            username: string
            avatarUrl: string
            email: string | null
        }) => Effect.Effect<UserProfile, AuthError>
        listFavorites: (
            userId: string,
        ) => Effect.Effect<readonly UserFavorite[], AuthError>
        upsertFavorite: (
            userId: string,
            favorite: FavoriteInput,
        ) => Effect.Effect<UserFavorite, AuthError>
        deleteFavorite: (
            userId: string,
            favorite: { id: string; type: string },
        ) => Effect.Effect<void, AuthError>
        listConnections: (
            userId: string,
        ) => Effect.Effect<readonly UserConnection[], AuthError>
        syncConnections: (
            session: AuthSession,
        ) => Effect.Effect<readonly UserConnection[], AuthError>
    }
>()("app/Auth") {}

export const layer = Layer.effect(
    Auth,
    Effect.gen(function* () {
        const db = yield* SqlDatabase

        /** Wraps the whole auth program so failures stay in the error channel. */
        const guard = <A, E, R>(
            effect: Effect.Effect<A, E, R>,
        ): Effect.Effect<A, AuthError, R> =>
            effect.pipe(Effect.mapError((cause) => new AuthError({ cause })))

        const sessionIdOf = (headers: Headers) =>
            Effect.gen(function* () {
                const token = readCookie(headers.get("cookie"), SESSION_COOKIE)

                if (!token) return null

                return yield* Effect.promise(() => sha256Hex(token))
            })

        return Auth.of({
            getSession: (headers) =>
                guard(
                    Effect.gen(function* () {
                        const sessionId = yield* sessionIdOf(headers)

                        if (!sessionId) return null

                        const [session] = yield* db
                            .select()
                            .from(userSession)
                            .where(eq(userSession.id, sessionId))
                            .limit(1)

                        if (!session) return null

                        if (session.expiresAt.getTime() <= Date.now()) {
                            yield* db
                                .delete(userSession)
                                .where(eq(userSession.id, sessionId))

                            return null
                        }

                        const [user] = yield* db
                            .select()
                            .from(userProfile)
                            .where(eq(userProfile.id, session.userId))
                            .limit(1)

                        if (!user) return null

                        let accessToken = session.discordAccessToken

                        // Refresh shortly before expiry so requests do not race
                        // the token's death.
                        if (
                            session.discordRefreshToken &&
                            session.discordTokenExpiresAt.getTime() -
                                Date.now() <
                                REFRESH_MARGIN_MS
                        ) {
                            const refreshed = yield* refreshDiscordToken({
                                refreshToken: session.discordRefreshToken,
                                ...(yield* Effect.promise(() =>
                                    discordConfig(),
                                )),
                            }).pipe(Effect.option)

                            if (Option.isSome(refreshed)) {
                                const token = refreshed.value
                                const expiresAt = new Date(
                                    Date.now() + token.expires_in * 1000,
                                )

                                accessToken = token.access_token

                                yield* db
                                    .update(userSession)
                                    .set({
                                        discordAccessToken: token.access_token,
                                        discordRefreshToken:
                                            token.refresh_token ??
                                            session.discordRefreshToken,
                                        discordTokenExpiresAt: expiresAt,
                                        scope: token.scope,
                                    })
                                    .where(eq(userSession.id, sessionId))
                            }
                        }

                        return {
                            user,
                            discordAccessToken: accessToken,
                            sessionId,
                            expiresAt: session.expiresAt,
                        }
                    }),
                ),

            createSession: (input) =>
                guard(
                    Effect.gen(function* () {
                        const token = randomToken()
                        const id = yield* Effect.promise(() => sha256Hex(token))
                        const expiresAt = new Date(
                            Date.now() + SESSION_TTL_SECONDS * 1000,
                        )

                        yield* db.insert(userSession).values({
                            id,
                            userId: input.userId,
                            discordAccessToken: input.accessToken,
                            discordRefreshToken: input.refreshToken,
                            discordTokenExpiresAt: new Date(
                                Date.now() + input.expiresIn * 1000,
                            ),
                            scope: input.scope,
                            expiresAt,
                        })

                        return { token, expiresAt }
                    }),
                ),

            deleteSession: (headers) =>
                guard(
                    Effect.gen(function* () {
                        const sessionId = yield* sessionIdOf(headers)

                        if (!sessionId) return

                        yield* db
                            .delete(userSession)
                            .where(eq(userSession.id, sessionId))
                    }),
                ),

            upsertDiscordUser: (input) =>
                guard(
                    Effect.gen(function* () {
                        const [user] = yield* db
                            .insert(userProfile)
                            .values({
                                discordId: input.discordId,
                                username: input.username,
                                avatarUrl: input.avatarUrl,
                                email: input.email,
                            })
                            .onConflictDoUpdate({
                                target: userProfile.discordId,
                                set: {
                                    username: input.username,
                                    avatarUrl: input.avatarUrl,
                                    email: input.email,
                                },
                            })
                            .returning()

                        if (!user) {
                            throw new Error(
                                "Failed to upsert the Discord profile",
                            )
                        }

                        return user
                    }),
                ),

            listFavorites: (userId) =>
                guard(
                    db
                        .select()
                        .from(userFavorite)
                        .where(eq(userFavorite.userId, userId)),
                ),

            upsertFavorite: (userId, favorite) =>
                guard(
                    Effect.gen(function* () {
                        const [row] = yield* db
                            .insert(userFavorite)
                            .values({
                                userId,
                                id: favorite.id,
                                type: favorite.type,
                                name: favorite.name,
                                meta: favorite.meta,
                            })
                            .onConflictDoUpdate({
                                target: [
                                    userFavorite.userId,
                                    userFavorite.type,
                                    userFavorite.id,
                                ],
                                set: {
                                    name: favorite.name,
                                    meta: favorite.meta,
                                },
                            })
                            .returning()

                        if (!row) {
                            throw new Error("Failed to save the favorite")
                        }

                        return row
                    }),
                ),

            deleteFavorite: (userId, favorite) =>
                guard(
                    db
                        .delete(userFavorite)
                        .where(
                            and(
                                eq(userFavorite.userId, userId),
                                eq(userFavorite.type, favorite.type),
                                eq(userFavorite.id, favorite.id),
                            ),
                        ),
                ),

            listConnections: (userId) =>
                guard(
                    db
                        .select()
                        .from(userConnection)
                        .where(eq(userConnection.userId, userId)),
                ),

            syncConnections: (session) =>
                guard(
                    Effect.gen(function* () {
                        const connections = yield* fetchDiscordConnections(
                            session.discordAccessToken,
                        )

                        if (connections.length > 0) {
                            yield* db
                                .insert(userConnection)
                                .values(
                                    connections.map((connection) => ({
                                        userId: session.user.id,
                                        appId: connection.id,
                                        type: connection.type,
                                        name: connection.name,
                                        verified: connection.verified,
                                    })),
                                )
                                .onConflictDoUpdate({
                                    target: [
                                        userConnection.userId,
                                        userConnection.type,
                                        userConnection.appId,
                                    ],
                                    set: {
                                        name: sqlExcluded("name"),
                                        verified: sqlExcluded("verified"),
                                    },
                                })
                        }

                        return yield* db
                            .select()
                            .from(userConnection)
                            .where(eq(userConnection.userId, session.user.id))
                    }),
                ),
        })
    }),
)

/** `excluded."col"` — the value proposed by the conflicting insert. */
const sqlExcluded = (column: string) => sql`excluded.${sql.identifier(column)}`
