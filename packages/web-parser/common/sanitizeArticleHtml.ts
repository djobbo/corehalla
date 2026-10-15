import { load } from "cheerio"
import type { Element } from "cheerio"

/**
 * Allow-list sanitizer for Brawlhalla's WordPress article HTML.
 *
 * The source is a first-party CMS, so this is not the only line of defence, but
 * the body is injected with `dangerouslySetInnerHTML` — scripts, event handlers
 * and `javascript:` URLs must never survive. Unknown tags are unwrapped (their
 * children are kept) and dangerous containers are removed outright.
 */

const DROP_TAGS = [
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "math",
    "form",
    "input",
    "button",
    "select",
    "textarea",
    "link",
    "meta",
    "base",
    "object",
    "embed",
    "applet",
] as const

const ALLOWED_TAGS = new Set([
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "span",
    "small",
    "mark",
    "sub",
    "sup",
    "a",
    "img",
    "figure",
    "figcaption",
    "blockquote",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "video",
    "source",
    "audio",
    "iframe",
    "div",
])

const TAG_ATTRS: Record<string, readonly string[]> = {
    a: ["href", "title"],
    img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"],
    blockquote: ["cite"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    video: ["src", "poster", "controls", "width", "height"],
    source: ["src", "srcset", "type", "media", "sizes"],
    audio: ["src", "controls"],
    iframe: [
        "src",
        "width",
        "height",
        "title",
        "allow",
        "allowfullscreen",
        "frameborder",
    ],
}

/** Embeds the CMS actually uses (YouTube/Twitch/Spotify); everything else is dropped. */
const IFRAME_HOSTS = [
    "youtube.com",
    "youtube-nocookie.com",
    "twitch.tv",
    "spotify.com",
    "facebook.com",
] as const

/** Control characters can smuggle `java\0script:` past a naive prefix check. */
const stripControlChars = (value: string): string => {
    let out = ""

    for (const char of value) {
        const code = char.codePointAt(0) ?? 0

        if (code > 0x1f && code !== 0x7f) out += char
    }

    return out
}

const isUnsafeScheme = (value: string): boolean => {
    const normalized = stripControlChars(value).trimStart().toLowerCase()

    return (
        normalized.startsWith("javascript:") ||
        normalized.startsWith("vbscript:") ||
        normalized.startsWith("data:")
    )
}

const isSafeUrl = (value: string): boolean =>
    value.trim() !== "" && !isUnsafeScheme(value)

const isSafeSrcset = (value: string): boolean =>
    !isUnsafeScheme(value) &&
    value.split(",").every((candidate) => {
        const url = candidate.trim().split(/\s+/)[0]

        return url === undefined || url === "" || !isUnsafeScheme(url)
    })

const isAllowedIframeSrc = (value: string): boolean => {
    try {
        const url = new URL(value, "https://www.brawlhalla.com")

        if (url.protocol !== "https:" && url.protocol !== "http:") return false

        return IFRAME_HOSTS.some(
            (host) =>
                url.hostname === host || url.hostname.endsWith(`.${host}`),
        )
    } catch {
        return false
    }
}

const isExternalHref = (href: string): boolean => {
    try {
        const url = new URL(href, "https://www.brawlhalla.com")

        return (
            url.hostname !== "brawlhalla.com" &&
            !url.hostname.endsWith(".brawlhalla.com")
        )
    } catch {
        return false
    }
}

export const sanitizeArticleHtml = (html: string): string => {
    const $ = load(html, null, false)

    $(DROP_TAGS.join(",")).remove()

    for (const element of $("*").toArray() as Element[]) {
        const tag = element.name.toLowerCase()

        if (!ALLOWED_TAGS.has(tag)) {
            $(element).replaceWith($(element).contents())
            continue
        }

        const allowed = TAG_ATTRS[tag] ?? []

        for (const name of Object.keys(element.attribs)) {
            const value = element.attribs[name] ?? ""

            if (!allowed.includes(name)) {
                delete element.attribs[name]
                continue
            }

            if (name === "src" || name === "href" || name === "poster") {
                if (!isSafeUrl(value)) delete element.attribs[name]
            } else if (name === "srcset" && !isSafeSrcset(value)) {
                delete element.attribs[name]
            }
        }

        if (
            tag === "iframe" &&
            !isAllowedIframeSrc(element.attribs.src ?? "")
        ) {
            $(element).remove()
            continue
        }

        if (tag === "img" && !element.attribs.src) {
            $(element).remove()
            continue
        }

        if (tag === "a") {
            if (!element.attribs.href) {
                $(element).replaceWith($(element).contents())
                continue
            }

            if (isExternalHref(element.attribs.href)) {
                element.attribs.target = "_blank"
            }

            element.attribs.rel = "noopener noreferrer"
        }
    }

    $("*")
        .add($.root())
        .contents()
        .each((_, node) => {
            if (node.type === "comment") $(node).remove()
        })

    return $.html()
}
