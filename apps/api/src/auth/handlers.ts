import { Duration, Effect, Exit } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Auth } from "./Auth"
import { discordConfig, discordRedirectUri, isSecureRequest } from "./config"
import { OAUTH_STATE_COOKIE, SESSION_COOKIE, randomToken } from "./cookies"
import {
    discordAuthorizeUrl,
    discordAvatarUrl,
    exchangeDiscordCode,
    fetchDiscordProfile,
} from "./discord"
import type { JsonValue } from "@crh/db/schema"

/**
 * The server implementations of the `me` and `auth` groups.
 *
 * Two kinds of endpoint live here, and they are shaped differently on purpose:
 *
 * - The `me` endpoints are ordinary JSON. They read the session cookie, scope
 *   every query to its user, and answer an anonymous caller with an explicit
 *   401 rather than an empty result — "signed out" and "no favourites" are
 *   different facts and the client must be able to tell them apart.
 * - The `auth` endpoints are browser navigations. They return an
 *   `HttpServerResponse` — a redirect plus `Set-Cookie` — which is why the
 *   contract declares a placeholder success: the redirect *is* the payload, and
 *   the framework must not try to JSON-encode it.
 *
 * Cookies are read and written through Effect's own primitives
 * (`HttpServerRequest.cookies`, `HttpServerResponse.setCookieUnsafe` /
 * `expireCookie`) rather than hand-rolled header strings, so the encoding of
 * `Max-Age`, `SameSite` and expiry is the platform's problem and not a second
 * implementation that can disagree with it.
 *
 * One HTTP detail is worth spelling out because getting it wrong is silent:
 * `HttpServerRequest.url` is the **path only** — Effect strips the host — so
 * every absolute URL here (the OAuth callback, the post-sign-in redirect, and
 * the `Secure` cookie decision) is built from `originalUrl`, which is the URL
 * the browser actually requested. Using `url` as a `new URL` base throws
 * `TypeError: Invalid URL string`; using it for the protocol check quietly
 * leaves `Secure` off the session cookie.
 *
 * `Effect.orDie` closes every handler. The contract declares no error schema
 * for these endpoints — a missing session is a 401 the handler returns, not a
 * failure — so the only errors left are infrastructure ones (a D1 write that
 * failed, a cookie that could not be encoded). Those are defects, and the API's
 * error handler turns them into a 500 rather than a typed response the client
 * would have to interpret.
 */

/** The request's session, or `null` when the caller is anonymous. */
const sessionOf = (
    auth: Auth["Service"],
    cookies: Readonly<Record<string, string>>,
) => auth.getSession(cookies)

export const meGroup = HttpApiBuilder.group(
    CorehallaApi,
    "me",
    Effect.fnUntraced(function* (handlers) {
        const auth = yield* Auth

        return handlers
            .handle("getSession", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    return { user: session?.user ?? null }
                }).pipe(Effect.orDie),
            )
            .handle("getFavorites", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    if (!session) {
                        return HttpServerResponse.empty({ status: 401 })
                    }

                    return yield* auth.listFavorites(session.user.id)
                }).pipe(Effect.orDie),
            )
            .handle("addFavorite", ({ payload }) =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    if (!session) {
                        return HttpServerResponse.empty({ status: 401 })
                    }

                    return yield* auth.upsertFavorite(session.user.id, {
                        id: payload.id,
                        type: payload.type,
                        name: payload.name,
                        /*
                         * `meta` is client-authored and decoded as `unknown`;
                         * it lands in a JSON column and nothing on the server
                         * reads it back. This is the one boundary where that
                         * value has to be named as JSON.
                         */
                        meta: payload.meta as JsonValue,
                    })
                }).pipe(Effect.orDie),
            )
            .handle("deleteFavorite", ({ query }) =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    if (!session) {
                        return HttpServerResponse.empty({ status: 401 })
                    }

                    yield* auth.deleteFavorite(session.user.id, query)

                    // The endpoint's `NoContent` schema encodes the empty 204.
                    return undefined
                }).pipe(Effect.orDie),
            )
            .handle("getConnections", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    if (!session) {
                        return HttpServerResponse.empty({ status: 401 })
                    }

                    return yield* auth.listConnections(session.user.id)
                }).pipe(Effect.orDie),
            )
            .handle("syncConnections", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const session = yield* sessionOf(auth, request.cookies)

                    if (!session) {
                        return HttpServerResponse.empty({ status: 401 })
                    }

                    return yield* auth.syncConnections(session)
                }).pipe(Effect.orDie),
            )
    }),
)

export const authGroup = HttpApiBuilder.group(
    CorehallaApi,
    "auth",
    Effect.fnUntraced(function* (handlers) {
        const auth = yield* Auth

        return handlers
            .handle("discordLogin", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const { clientId } = yield* discordConfig

                    if (!clientId) {
                        return HttpServerResponse.empty({ status: 500 })
                    }

                    const state = randomToken(16)
                    const secure = isSecureRequest(request.originalUrl)

                    return HttpServerResponse.setCookieUnsafe(
                        HttpServerResponse.redirect(
                            discordAuthorizeUrl({
                                clientId,
                                redirectUri: discordRedirectUri(request.originalUrl),
                                state,
                            }),
                            { status: 302 },
                        ),
                        OAUTH_STATE_COOKIE,
                        state,
                        {
                            maxAge: Duration.minutes(10),
                            httpOnly: true,
                            secure,
                            sameSite: "lax",
                            path: "/",
                        },
                    )
                }).pipe(Effect.orDie),
            )
            .handle("discordCallback", ({ query }) =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const { clientId, clientSecret } = yield* discordConfig
                    const secure = isSecureRequest(request.originalUrl)
                    const cookieState = request.cookies[OAUTH_STATE_COOKIE]

                    const appUrl = (path: string) =>
                        new URL(path, request.originalUrl).toString()

                    // The state is single-use: whichever way this request ends,
                    // the cookie is cleared so an old authorize link cannot be
                    // replayed against a fresh sign-in.
                    const clearState = (
                        response: HttpServerResponse.HttpServerResponse,
                    ) =>
                        HttpServerResponse.expireCookie(
                            response,
                            OAUTH_STATE_COOKIE,
                            {
                                path: "/",
                                httpOnly: true,
                                secure,
                                sameSite: "lax",
                            },
                        )

                    const fail = () =>
                        clearState(
                            HttpServerResponse.redirect(
                                appUrl("/?auth=error"),
                                { status: 303 },
                            ),
                        )

                    const code = query.code
                    const state = query.state

                    if (
                        query.error ||
                        !code ||
                        !state ||
                        !cookieState ||
                        cookieState !== state
                    ) {
                        return yield* fail()
                    }

                    const session = yield* Effect.gen(function* () {
                        const token = yield* exchangeDiscordCode({
                            code,
                            clientId,
                            clientSecret,
                            redirectUri: discordRedirectUri(request.originalUrl),
                        })

                        const profile = yield* fetchDiscordProfile(
                            token.access_token,
                        )

                        const user = yield* auth.upsertDiscordUser({
                            discordId: profile.id,
                            username: profile.username,
                            avatarUrl: discordAvatarUrl(profile),
                            email: profile.email ?? null,
                        })

                        return yield* auth.createSession({
                            userId: user.id,
                            accessToken: token.access_token,
                            refreshToken: token.refresh_token ?? null,
                            expiresIn: token.expires_in,
                            scope: token.scope,
                        })
                    }).pipe(Effect.exit)

                    if (Exit.isFailure(session)) {
                        return yield* fail()
                    }

                    const maxAge = Math.max(
                        0,
                        Math.floor(
                            (session.value.expiresAt.getTime() - Date.now()) /
                                1000,
                        ),
                    )

                    return yield* clearState(
                        HttpServerResponse.setCookieUnsafe(
                            HttpServerResponse.redirect(
                                appUrl("/?auth=ok"),
                                { status: 303 },
                            ),
                            SESSION_COOKIE,
                            session.value.token,
                            {
                                maxAge: Duration.seconds(maxAge),
                                httpOnly: true,
                                secure,
                                sameSite: "lax",
                                path: "/",
                            },
                        ),
                    )
                }).pipe(Effect.orDie),
            )
            .handle("signOut", () =>
                Effect.gen(function* () {
                    const request = yield* HttpServerRequest.HttpServerRequest
                    const secure = isSecureRequest(request.originalUrl)

                    // Clearing the cookie is what the caller observes; a
                    // database hiccup must not keep them "signed in".
                    yield* auth
                        .deleteSession(request.cookies)
                        .pipe(Effect.orElseSucceed(() => undefined))

                    return yield* HttpServerResponse.expireCookie(
                        HttpServerResponse.empty({ status: 204 }),
                        SESSION_COOKIE,
                        {
                            path: "/",
                            httpOnly: true,
                            secure,
                            sameSite: "lax",
                        },
                    )
                }).pipe(Effect.orDie),
            )
    }),
)
