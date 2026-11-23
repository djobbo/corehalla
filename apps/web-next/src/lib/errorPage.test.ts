import { describe, expect, it } from "@effect/vitest"
import { notFound } from "@tanstack/react-router"
import { errorPageFor, notFoundPage, serverErrorPage } from "./errorPage"

const robotsMeta = (meta: readonly { readonly name?: string }[]) =>
    meta.filter((entry) => entry.name === "robots")

describe("errorPageFor", () => {
    it("maps a router not-found to the 404 page", () => {
        const page = errorPageFor(notFound())

        expect(page.status).toBe(404)
        expect(page.title).toBe("Page not found")
        expect(page.image).toBe("/images/errors/404.png")
    })

    it("maps a tagged NotFound failure to the 404 page", () => {
        const page = errorPageFor({ _tag: "NotFound" })

        expect(page.status).toBe(404)
        expect(page.image).toBe("/images/errors/404.png")
    })

    it("maps an unknown error to the 500 page", () => {
        const page = errorPageFor(new Error("upstream failed"))

        expect(page.status).toBe(500)
        expect(page.title).toBe("Something went wrong")
        expect(page.image).toBe("/images/errors/500.png")
    })
})

describe("error page head tags", () => {
    it("marks the 404 page noindex and titles it", () => {
        expect(notFoundPage.meta).toContainEqual({
            title: "Page not found • Corehalla",
        })
        expect(robotsMeta(notFoundPage.meta)).toEqual([
            { name: "robots", content: "noindex" },
        ])
    })

    it("keeps the 500 page indexable", () => {
        expect(serverErrorPage.meta).toContainEqual({
            title: "Something went wrong • Corehalla",
        })
        expect(robotsMeta(serverErrorPage.meta)).toEqual([])
    })
})
