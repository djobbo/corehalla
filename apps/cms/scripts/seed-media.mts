import {
    Config,
    Context,
    Effect,
    FileSystem,
    Layer,
    Option,
    Path,
    Ref,
    Schema,
} from "effect"
import * as Cookies from "effect/http/Cookies"
import * as HttpClient from "effect/http/HttpClient"
import * as HttpClientRequest from "effect/http/HttpClientRequest"
import * as HttpClientResponse from "effect/http/HttpClientResponse"
import * as FetchHttpClient from "effect/http/FetchHttpClient"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"

class SeedError extends Schema.TaggedError<SeedError>()("SeedError", {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Defect()),
}) {}

const MediaUploadResponse = Schema.Struct({
    success: Schema.Literal(true),
    data: Schema.Struct({
        item: Schema.Struct({ id: Schema.String }),
    }),
})

const ContentListResponse = Schema.Struct({
    success: Schema.Literal(true),
    data: Schema.Struct({
        items: Schema.Array(
            Schema.Struct({
                id: Schema.String,
                data: Schema.Struct({
                    key: Schema.optionalKey(Schema.String),
                }),
            }),
        ),
        total: Schema.Number,
    }),
})

const ContentCreateResponse = Schema.Struct({
    success: Schema.Literal(true),
    data: Schema.Struct({
        item: Schema.Struct({ id: Schema.String }),
    }),
})

type MediaSlot = {
    readonly key: string
    readonly slug: string
    readonly label: string
    readonly alt: string
    readonly kind: "ranked-banner" | "legend-icon" | "weapon-icon"
    readonly file: string
}

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

const humanize = (value: string): string =>
    value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())

const slotFor = (
    file: string,
    kind: MediaSlot["kind"],
): Omit<MediaSlot, "file"> | null => {
    const stem = file.slice(0, -".png".length)
    if (kind === "ranked-banner" && stem.toLowerCase() === "null") return null

    const slug = slugify(stem)
    if (slug.length === 0) return null

    if (kind === "ranked-banner") {
        return {
            key: `ranked.banner.${slug}`,
            slug: `ranked-banner-${slug}`,
            label: `Ranked banner — ${stem}`,
            alt: `${stem} ranked banner`,
            kind,
        }
    }

    const name = humanize(slug)
    const noun = kind === "weapon-icon" ? "weapon" : "legend"
    return {
        key: `${noun}.icon.${slug}`,
        slug: `${noun}-icon-${slug}`,
        label: `${name} ${noun} icon`,
        alt: `${name} ${noun} icon`,
        kind,
    }
}

const slotData = (slot: MediaSlot, mediaId: string) => ({
    key: slot.key,
    label: slot.label,
    alt: slot.alt,
    kind: slot.kind,
    image: { id: mediaId },
})

const mediaPath = "images/ranked-banners"
const legendPath = "images/icons/roster/legends"
const weaponPath = "images/icons/weapons"

const decodeResponse = <S extends Schema.Constraint>(
    schema: S,
    response: HttpClientResponse.HttpClientResponse,
) =>
    HttpClientResponse.schemaBodyJson(schema)(response).pipe(
        Effect.mapError(
            (cause) =>
                new SeedError({
                    message: "Invalid EmDash response",
                    cause,
                }),
        ),
    )

const readPngFiles = (
    fs: FileSystem.FileSystem,
    directory: string,
): Effect.Effect<ReadonlyArray<string>, SeedError> =>
    fs.readDirectory(directory).pipe(
        Effect.map((entries) =>
            entries
                .filter((file) => file.toLowerCase().endsWith(".png"))
                .sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
        ),
        Effect.mapError(
            (cause) =>
                new SeedError({
                    message: `Could not read ${directory}`,
                    cause,
                }),
        ),
    )

class MediaSeeder extends Context.Service<
    MediaSeeder,
    {
        readonly run: Effect.Effect<void, SeedError>
    }
>()("cms/MediaSeeder") {
    static readonly layer = Layer.effect(
        MediaSeeder,
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem
            const path = yield* Path.Path
            const client = yield* HttpClient.HttpClient
            const config = yield* Config.all({
                baseUrl: Config.String("EMDASH_URL").pipe(
                    Config.withDefault("http://localhost:3002"),
                ),
                token: Config.option(Config.String("EMDASH_TOKEN")),
                concurrency: Config.option(Config.Number("EMDASH_CONCURRENCY")),
            }).pipe(
                Effect.mapError(
                    (cause) =>
                        new SeedError({
                            message: "Invalid EmDash configuration",
                            cause,
                        }),
                ),
            )
            const cookie = yield* Ref.make(Option.none<string>())
            const baseUrl = config.baseUrl.replace(/\/+$/, "")
            const isLocal =
                baseUrl.startsWith("http://localhost:") ||
                baseUrl.startsWith("http://127.0.0.1:")
            const concurrency = Math.min(
                Math.max(
                    Math.floor(
                        Option.getOrElse(config.concurrency, () =>
                            isLocal ? 1 : 4,
                        ),
                    ),
                    1,
                ),
                16,
            )

            const execute = Effect.fn("MediaSeeder.execute")(function* (
                request: HttpClientRequest.HttpClientRequest,
            ) {
                let authenticated = request.pipe(
                    HttpClientRequest.setHeader("X-EmDash-Request", "1"),
                )

                if (Option.isSome(config.token)) {
                    authenticated = authenticated.pipe(
                        HttpClientRequest.setHeader(
                            "Authorization",
                            `Bearer ${config.token.value}`,
                        ),
                    )
                }

                const session = yield* Ref.get(cookie)
                if (Option.isSome(session)) {
                    authenticated = authenticated.pipe(
                        HttpClientRequest.setHeader(
                            "Cookie",
                            `astro-session=${session.value}`,
                        ),
                    )
                }

                const response = yield* client.execute(authenticated).pipe(
                    Effect.mapError(
                        (cause) =>
                            new SeedError({
                                message: "EmDash request failed",
                                cause,
                            }),
                    ),
                )

                const nextSession = Option.map(
                    Cookies.get(response.cookies, "astro-session"),
                    (value) => value.value,
                )
                if (Option.isSome(nextSession)) {
                    yield* Ref.set(cookie, nextSession)
                }

                if (response.status < 200 || response.status >= 300) {
                    const text = yield* response.text.pipe(
                        Effect.mapError(
                            (cause) =>
                                new SeedError({
                                    message: "Could not read EmDash error",
                                    cause,
                                }),
                        ),
                    )

                    return yield* new SeedError({
                        message: `EmDash request failed: ${response.status} ${text}`,
                    })
                }

                return response
            })

            const executeJson = <S extends Schema.Constraint>(
                schema: S,
                request: HttpClientRequest.HttpClientRequest,
            ) =>
                Effect.flatMap(execute(request), (response) =>
                    decodeResponse(schema, response),
                )

            const url = (pathname: string): string => `${baseUrl}${pathname}`

            const collectSlots = Effect.fn("MediaSeeder.collectSlots")(
                function* () {
                    const scriptDir = yield* path
                        .fromFileUrl(new URL(".", import.meta.url))
                        .pipe(
                            Effect.mapError(
                                (cause) =>
                                    new SeedError({
                                        message:
                                            "Could not resolve script directory",
                                        cause,
                                    }),
                            ),
                        )
                    const webPublic = path.resolve(
                        scriptDir,
                        "../../web/public",
                    )
                    const directories = [
                        {
                            directory: path.join(webPublic, mediaPath),
                            kind: "ranked-banner" as const,
                        },
                        {
                            directory: path.join(webPublic, legendPath),
                            kind: "legend-icon" as const,
                        },
                        {
                            directory: path.join(webPublic, weaponPath),
                            kind: "weapon-icon" as const,
                        },
                    ]

                    const slots: Array<MediaSlot> = []
                    for (const entry of directories) {
                        for (const file of yield* readPngFiles(
                            fs,
                            entry.directory,
                        )) {
                            const slot = slotFor(file, entry.kind)
                            if (slot !== null) {
                                slots.push({
                                    ...slot,
                                    file: path.join(entry.directory, file),
                                })
                            }
                        }
                    }

                    return slots
                },
            )

            const authenticate = Effect.fn("MediaSeeder.authenticate")(
                function* () {
                    if (Option.isSome(config.token)) return

                    yield* execute(
                        HttpClientRequest.get(
                            url(
                                "/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin",
                            ),
                        ),
                    )

                    if (Option.isNone(yield* Ref.get(cookie))) {
                        return yield* new SeedError({
                            message: `Could not authenticate to ${baseUrl}. Start the local CMS with \`vpr dev\`, or set EMDASH_URL and EMDASH_TOKEN.`,
                        })
                    }
                },
            )

            const existingSlots = Effect.fn("MediaSeeder.existingSlots")(
                function* () {
                    const slots = new Map<string, string>()
                    let page = 1
                    let total = Number.POSITIVE_INFINITY

                    while ((page - 1) * 100 < total || page === 1) {
                        const body = yield* executeJson(
                            ContentListResponse,
                            HttpClientRequest.get(
                                url(
                                    `/_emdash/api/content/media_slots?limit=100&page=${page}&status=all`,
                                ),
                            ),
                        )

                        total = body.data.total
                        for (const item of body.data.items) {
                            if (item.data.key) {
                                slots.set(item.data.key, item.id)
                            }
                        }
                        if (body.data.items.length === 0) break
                        page += 1
                    }

                    return slots
                },
            )

            const upload = Effect.fn("MediaSeeder.upload")(function* (
                slot: MediaSlot,
            ) {
                const bytes = yield* fs.readFile(slot.file).pipe(
                    Effect.mapError(
                        (cause) =>
                            new SeedError({
                                message: `Could not read ${slot.file}`,
                                cause,
                            }),
                    ),
                )
                const fileBytes = bytes.buffer.slice(
                    bytes.byteOffset,
                    bytes.byteOffset + bytes.byteLength,
                ) as ArrayBuffer
                const form = new FormData()
                form.append(
                    "file",
                    new Blob([fileBytes], { type: "image/png" }),
                    path.basename(slot.file),
                )
                form.append("alt", slot.alt)

                const body = yield* executeJson(
                    MediaUploadResponse,
                    HttpClientRequest.post(url("/_emdash/api/media")).pipe(
                        HttpClientRequest.bodyFormData(form),
                    ),
                )

                return body.data.item.id
            })

            const publish = Effect.fn("MediaSeeder.publish")(function* (
                id: string,
            ) {
                const body = yield* HttpClientRequest.bodyJson({})(
                    HttpClientRequest.post(
                        url(`/_emdash/api/content/media_slots/${id}/publish`),
                    ),
                ).pipe(
                    Effect.mapError(
                        (cause) =>
                            new SeedError({
                                message: "Could not encode publish request",
                                cause,
                            }),
                    ),
                )
                yield* execute(body)
            })

            const createSlot = Effect.fn("MediaSeeder.createSlot")(function* (
                slot: MediaSlot,
                mediaId: string,
            ) {
                const body = yield* HttpClientRequest.bodyJson({
                    slug: slot.slug,
                    data: slotData(slot, mediaId),
                })(
                    HttpClientRequest.post(
                        url("/_emdash/api/content/media_slots"),
                    ),
                ).pipe(
                    Effect.mapError(
                        (cause) =>
                            new SeedError({
                                message: "Could not encode slot request",
                                cause,
                            }),
                    ),
                )
                const created = yield* executeJson(ContentCreateResponse, body)
                yield* publish(created.data.item.id)
            })

            const updateSlot = Effect.fn("MediaSeeder.updateSlot")(function* (
                id: string,
                slot: MediaSlot,
                mediaId: string,
            ) {
                const body = yield* HttpClientRequest.bodyJson({
                    data: slotData(slot, mediaId),
                    overrideLock: true,
                })(
                    HttpClientRequest.put(
                        url(`/_emdash/api/content/media_slots/${id}`),
                    ),
                ).pipe(
                    Effect.mapError(
                        (cause) =>
                            new SeedError({
                                message: "Could not encode slot request",
                                cause,
                            }),
                    ),
                )
                yield* execute(body)
                yield* publish(id)
            })

            const run = Effect.fn("MediaSeeder.run")(function* () {
                const slots = yield* collectSlots()
                yield* authenticate()
                const existing = yield* existingSlots()

                yield* Effect.logInfo(
                    `Uploading ${slots.length} media files (concurrency ${concurrency})`,
                )
                const mediaIds = yield* Effect.forEach(
                    slots,
                    (slot) => upload(slot),
                    { concurrency },
                )

                let created = 0
                let updated = 0
                for (const [index, slot] of slots.entries()) {
                    const mediaId = mediaIds[index]
                    const id = existing.get(slot.key)

                    if (id) {
                        yield* updateSlot(id, slot, mediaId)
                        updated += 1
                    } else {
                        yield* createSlot(slot, mediaId)
                        created += 1
                    }

                    yield* Effect.logInfo(
                        `[${index + 1}/${slots.length}] ${slot.key}`,
                    )
                }

                yield* Effect.logInfo(
                    `Done: ${created} created, ${updated} updated, ${existing.size + created} total slots`,
                )
            })

            return MediaSeeder.of({ run: run() })
        }),
    )
}

const PlatformLayer = Layer.mergeAll(NodeServices.layer, FetchHttpClient.layer)

NodeRuntime.runMain(
    Effect.gen(function* () {
        const seeder = yield* MediaSeeder
        yield* seeder.run
    }).pipe(
        Effect.provide(MediaSeeder.layer.pipe(Layer.provide(PlatformLayer))),
    ),
)
