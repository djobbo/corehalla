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
    page: Schema.String.check(Schema.isStartingWith("/legends/")),
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

export class MissingSplashError extends Schema.TaggedError<MissingSplashError>()(
    "MissingSplashError",
    {
        name: Schema.String,
        page: Schema.String,
    },
) {}

const HttpsUrl = Schema.String.check(Schema.isStartingWith("https://"))

export const legendPageUrl = (page: string) => new URL(page, LEGENDS_URL).href

export type LegendFile = {
    readonly icon: RosterIcon
    readonly fileName: string
}

const ICONS_DIRECTORY = "../../apps/web/public/images/icons/roster/legends"
const SPLASH_DIRECTORY = "../../apps/web/public/images/splash/legends"

const imageDirectory = Effect.fn("roster.imageDirectory")(function* (
    relative: string,
) {
    const path = yield* Path.Path
    const here = yield* path.fromFileUrl(new URL(".", import.meta.url))
    return path.resolve(here, relative)
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
                page: $(el).closest("a").attr("href")?.trim() ?? "",
            }
        })
        .get()

    return Schema.decodeUnknownEffect(Schema.Array(RosterIcon))(raw)
}

export const parseSplash = (html: string) => {
    const src = load(html)("img.splash").first().attr("src")?.trim() ?? ""
    return Schema.decodeUnknownEffect(HttpsUrl)(src)
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

const downloadFile = Effect.fnUntraced(function* (
    src: string,
    destination: string,
) {
    const fs = yield* FileSystem.FileSystem
    const client = yield* http()
    const response = yield* client.get(src, {
        headers: { "user-agent": USER_AGENT },
    })
    const bytes = yield* response.arrayBuffer
    yield* fs.writeFile(destination, new Uint8Array(bytes))
})

const resetDirectory = Effect.fnUntraced(function* (directory: string) {
    const fs = yield* FileSystem.FileSystem
    yield* fs.remove(directory, { recursive: true, force: true })
    yield* fs.makeDirectory(directory, { recursive: true })
})

const downloadIcon = Effect.fnUntraced(function* (
    icon: RosterIcon,
    directory: string,
    fileName: string,
) {
    const path = yield* Path.Path
    yield* Effect.logInfo(`Downloading ${icon.name}`)
    yield* downloadFile(icon.src, path.join(directory, `${fileName}.png`))
})

const readSplash = Effect.fn("roster.readSplash")(function* (
    target: LegendFile,
) {
    const pageUrl = legendPageUrl(target.icon.page)
    const src = yield* parseSplash(yield* fetchText(pageUrl)).pipe(
        Effect.mapError(
            () =>
                new MissingSplashError({
                    name: target.icon.name,
                    page: pageUrl,
                }),
        ),
    )
    return { ...target, src }
})

const downloadSplash = Effect.fnUntraced(function* (
    name: string,
    src: string,
    destination: string,
) {
    yield* Effect.logInfo(`Downloading ${name} splash`)
    yield* downloadFile(src, destination)
})

export const downloadImages = Effect.fn("roster.downloadImages")(function* () {
    const path = yield* Path.Path
    const iconsDirectory = yield* imageDirectory(ICONS_DIRECTORY)
    const splashDirectory = yield* imageDirectory(SPLASH_DIRECTORY)
    const icons = yield* parseIcons(yield* fetchText(LEGENDS_URL))
    const targets = yield* legendFiles(icons)
    const splashes = yield* Effect.forEach(targets, readSplash, {
        concurrency: 8,
    })

    yield* resetDirectory(iconsDirectory)
    yield* resetDirectory(splashDirectory)
    yield* Effect.forEach(
        targets,
        ({ icon, fileName }) => downloadIcon(icon, iconsDirectory, fileName),
        { concurrency: 8 },
    )
    yield* Effect.forEach(
        splashes,
        ({ icon, fileName, src }) =>
            downloadSplash(
                icon.name,
                src,
                path.join(splashDirectory, `${fileName}.png`),
            ),
        { concurrency: 8 },
    )
    yield* Effect.logInfo(
        `Downloaded ${icons.length} roster legend images and splash art`,
    )
})
