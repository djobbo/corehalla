import { isNotFound } from "./routeErrors"

export type ErrorPageStatus = 404 | 500

type ErrorPageMeta = {
    readonly title?: string
    readonly name?: string
    readonly content?: string
}

export type ErrorPageContent = {
    readonly status: ErrorPageStatus
    readonly title: string
    readonly description: string
    readonly image: string
    readonly meta: readonly ErrorPageMeta[]
}

const page = (
    status: ErrorPageStatus,
    title: string,
    description: string,
): ErrorPageContent => ({
    status,
    title,
    description,
    image: `/images/errors/${status}.png`,
    meta: [
        { title: `${title} • Corehalla` },
        ...(status === 404 ? [{ name: "robots", content: "noindex" }] : []),
    ],
})

export const notFoundPage = page(
    404,
    "Page not found",
    "That address does not lead anywhere on Corehalla. Check the link, or start again from the front page.",
)

export const serverErrorPage = page(
    500,
    "Something went wrong",
    "This page could not load. The problem is usually temporary, so try again in a moment.",
)

/**
 * The router's own `notFound()` marker is an `isNotFound` flag, while API
 * failures carry an Effect `_tag`; a page reached through either is a 404.
 */
const isRouterNotFound = (error: unknown): boolean =>
    (error as { readonly isNotFound?: boolean } | null)?.isNotFound === true

export const errorPageFor = (error: unknown): ErrorPageContent =>
    isNotFound(error) || isRouterNotFound(error)
        ? notFoundPage
        : serverErrorPage
