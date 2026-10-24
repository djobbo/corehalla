import { legends } from "@crh/bhapi/legends"
import { load } from "cheerio"
import { Effect, Schema } from "effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import { HttpClient } from "effect/http"

export const LEGENDS_URL = "https://www.brawlhalla.com/legends/"

/** Effect's fetch client sends no user agent, and anonymous requests get blocked. */
const USER_AGENT = "Corehalla/1.0 (+https://corehalla.com)"

const RosterIcon = Schema.Struct({
    name: Schema.NonEmptyString,
    src: Schema.String.check(Schema.isStartingWith("https://")),
})

export type RosterIcon = typeof RosterIcon.Type

export class EmptyRosterError extends Schema.TaggedError<EmptyRosterError>()(
    "EmptyRosterError",
    {},
) {}

export class UnmatchedLegendError extends Schema.TaggedError<UnmatchedLegendError>()(
    "UnmatchedLegendError",
    {
        names: Schema.String,
    },
) {}

export type LegendFile = {
    readonly icon: RosterIcon
    readonly fileName: string
}

const legendsDirectory = Effect.fn("roster.legendsDirectory")(function* () {
    const path = yield* Path.Path
    const here = yield* path.fromFileUrl(new URL(".", import.meta.url))
    return path.resolve(
        here,
        "../../apps/web/public/images/icons/roster/legends",
    )
})

const http = Effect.fnUntraced(function* () {
    const client = yield* HttpClient.HttpClient
    return HttpClient.filterStatusOk(client)
})

const fetchText = Effect.fn("roster.fetchText")(function* (url: string) {
    const client = yield* http()
    const response = yield* client.get(url, {
        headers: { "user-agent": USER_AGENT },
    })
    return yield* response.text
})

export const parseIcons = (html: string) => {
    const $ = load(html)
    const raw: unknown = $(".legend-icon")
        .map((_, el) => {
            const img = $(el).find("img")
            return {
                name: img.attr("alt")?.trim() ?? "",
                src: img.attr("src")?.trim() ?? "",
            }
        })
        .get()

    return Schema.decodeUnknownEffect(Schema.Array(RosterIcon))(raw)
}

export const legendFiles = Effect.fnUntraced(function* (
    icons: ReadonlyArray<RosterIcon>,
) {
    if (icons.length === 0) return yield* new EmptyRosterError()

    const unmatched: Array<string> = []
    const targets: Array<LegendFile> = []
    for (const icon of icons) {
        const fileName = legends.find(
            (legend) => legend.bio_name === icon.name,
        )?.legend_name_key
        if (fileName === undefined) unmatched.push(icon.name)
        else targets.push({ icon, fileName })
    }

    if (unmatched.length > 0) {
        return yield* new UnmatchedLegendError({
            names: unmatched.join(", "),
        })
    }

    return targets
})

const downloadIcon = Effect.fnUntraced(function* (
    icon: RosterIcon,
    directory: string,
    fileName: string,
) {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const client = yield* http()
    const response = yield* client.get(icon.src, {
        headers: { "user-agent": USER_AGENT },
    })
    const bytes = yield* response.arrayBuffer

    yield* Effect.logInfo(`Downloading ${icon.name}`)
    yield* fs.writeFile(
        path.join(directory, `${fileName}.png`),
        new Uint8Array(bytes),
    )
})

export const downloadImages = Effect.fn("roster.downloadImages")(function* () {
    const fs = yield* FileSystem.FileSystem
    const directory = yield* legendsDirectory()
    const icons = yield* parseIcons(yield* fetchText(LEGENDS_URL))
    const targets = yield* legendFiles(icons)

    yield* fs.remove(directory, { recursive: true, force: true })
    yield* fs.makeDirectory(directory, { recursive: true })
    yield* Effect.forEach(
        targets,
        ({ icon, fileName }) => downloadIcon(icon, directory, fileName),
        { concurrency: 8 },
    )
    yield* Effect.logInfo(`Downloaded ${icons.length} roster legend images`)
})
