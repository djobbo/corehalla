import { Effect, Schema } from "effect"
import { HttpBody, HttpClient, HttpClientResponse } from "effect/unstable/http"
import { AuthError } from "./errors"

const DISCORD_API = "https://discord.com/api"

/** `prompt=consent` is what makes Discord issue a refresh token. */
export const DISCORD_SCOPES = [
    "identify",
    "email",
    "connections",
    "guilds",
] as const

const DiscordTokenSchema = Schema.Struct({
    access_token: Schema.String,
    refresh_token: Schema.optional(Schema.NullOr(Schema.String)),
    expires_in: Schema.Number,
    scope: Schema.String,
    token_type: Schema.String,
})

export type DiscordToken = typeof DiscordTokenSchema.Type

const DiscordProfileSchema = Schema.Struct({
    id: Schema.String,
    username: Schema.String,
    global_name: Schema.optional(Schema.NullOr(Schema.String)),
    avatar: Schema.optional(Schema.NullOr(Schema.String)),
    email: Schema.optional(Schema.NullOr(Schema.String)),
})

export type DiscordProfile = typeof DiscordProfileSchema.Type

const DiscordConnectionSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    type: Schema.String,
    verified: Schema.Boolean,
})

export type DiscordConnection = typeof DiscordConnectionSchema.Type

const DiscordConnectionsSchema = Schema.Array(DiscordConnectionSchema)

export const discordAuthorizeUrl = (input: {
    clientId: string
    redirectUri: string
    state: string
}) => {
    const params = new URLSearchParams({
        client_id: input.clientId,
        redirect_uri: input.redirectUri,
        response_type: "code",
        scope: DISCORD_SCOPES.join(" "),
        state: input.state,
        prompt: "consent",
    })

    return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export const discordAvatarUrl = (profile: {
    id: string
    avatar?: string | null
}) =>
    profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
        : ""

const decodeOk = <S extends Schema.Top>(schema: S) => {
    const decode = HttpClientResponse.schemaBodyJson(schema)

    return Effect.fnUntraced(function* (
        response: HttpClientResponse.HttpClientResponse,
    ) {
        if (response.status < 200 || response.status >= 300) {
            const body = yield* response.text.pipe(
                Effect.orElseSucceed(() => ""),
            )

            return yield* new AuthError({
                cause: new Error(
                    `Discord request failed (${response.status}): ${body}`,
                ),
            })
        }

        return yield* decode(response).pipe(
            Effect.mapError((cause) => new AuthError({ cause })),
        )
    })
}

const decodeToken = decodeOk(DiscordTokenSchema)

const postToken = Effect.fn("discord.postToken")(function* (
    body: Record<string, string>,
) {
    const client = yield* HttpClient.HttpClient
    const response = yield* client
        .post(`${DISCORD_API}/oauth2/token`, {
            body: HttpBody.urlParams(body),
        })
        .pipe(Effect.mapError((cause) => new AuthError({ cause })))

    return yield* decodeToken(response)
})

export const exchangeDiscordCode = Effect.fn("discord.exchangeCode")(
    function* (input: {
        code: string
        clientId: string
        clientSecret: string
        redirectUri: string
    }) {
        return yield* postToken({
            client_id: input.clientId,
            client_secret: input.clientSecret,
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: input.redirectUri,
        })
    },
)

export const refreshDiscordToken = Effect.fn("discord.refreshToken")(
    function* (input: {
        refreshToken: string
        clientId: string
        clientSecret: string
    }) {
        return yield* postToken({
            client_id: input.clientId,
            client_secret: input.clientSecret,
            grant_type: "refresh_token",
            refresh_token: input.refreshToken,
        })
    },
)

const getDiscord = <S extends Schema.Top>(schema: S, path: `/${string}`) => {
    const decode = decodeOk(schema)

    return Effect.fnUntraced(function* (token: string) {
        const client = yield* HttpClient.HttpClient
        const response = yield* client
            .get(`${DISCORD_API}${path}`, {
                headers: { authorization: `Bearer ${token}` },
            })
            .pipe(Effect.mapError((cause) => new AuthError({ cause })))

        return yield* decode(response)
    })
}

export const fetchDiscordProfile = getDiscord(
    DiscordProfileSchema,
    "/users/@me",
)

export const fetchDiscordConnections = getDiscord(
    DiscordConnectionsSchema,
    "/users/@me/connections",
)
