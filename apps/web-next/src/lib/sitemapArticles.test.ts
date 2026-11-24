import { describe, expect, it, vi } from "@effect/vitest"
import { articlePaths } from "./sitemap"
import {
    ARTICLE_PAGE_CAP,
    ARTICLE_PAGE_SIZE,
    fetchArticlePaths,
} from "./sitemapArticles"

const pageOf = (prefix: string, count: number): readonly string[] =>
    Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const stubSource =
    (pages: readonly (readonly string[])[], calls: number[] = []) =>
    async (page: number) => {
        calls.push(page)

        return {
            articles: (pages[page - 1] ?? []).map((slug) => ({ slug })),
        }
    }

describe("articlePaths", () => {
    it("prefixes news and update slugs with their route", () => {
        expect(
            articlePaths(["patch-notes-1", "esports-2"], ["launch"]),
        ).toEqual(["/news/patch-notes-1", "/news/esports-2", "/updates/launch"])
    })

    it("drops empty, whitespace and repeated slugs", () => {
        expect(
            articlePaths(["", "   ", "same", "same"], ["\n", "same"]),
        ).toEqual(["/news/same", "/updates/same"])
    })
})

describe("fetchArticlePaths", () => {
    it("pages both lists until a short page and prefixes every slug once", async () => {
        const newsCalls: number[] = []
        const updateCalls: number[] = []

        const paths = await fetchArticlePaths(
            stubSource(
                [pageOf("news-a", ARTICLE_PAGE_SIZE), pageOf("news-b", 3)],
                newsCalls,
            ),
            stubSource([pageOf("update-a", 2)], updateCalls),
        )

        const news = pageOf("news-a", ARTICLE_PAGE_SIZE)
            .concat(pageOf("news-b", 3))
            .map((slug) => `/news/${slug}`)
        const updates = pageOf("update-a", 2).map((slug) => `/updates/${slug}`)

        expect(paths).toEqual([...news, ...updates])
        expect(paths).toHaveLength(news.length + updates.length)
        expect(new Set(paths).size).toBe(paths.length)
        expect(newsCalls).toEqual([1, 2])
        expect(updateCalls).toEqual([1])
    })

    it("stops after one page when the first page is short", async () => {
        const calls: number[] = []

        const paths = await fetchArticlePaths(
            stubSource([pageOf("news", 1)], calls),
            stubSource([], []),
        )

        expect(calls).toEqual([1])
        expect(paths).toEqual(["/news/news-1"])
    })

    it("stops at the page cap when every page comes back full", async () => {
        const calls: number[] = []
        const full = async (page: number) => {
            calls.push(page)

            return {
                articles: pageOf(`article-${page}`, ARTICLE_PAGE_SIZE).map(
                    (slug) => ({ slug }),
                ),
            }
        }

        const paths = await fetchArticlePaths(full, stubSource([], []))

        expect(calls).toHaveLength(ARTICLE_PAGE_CAP)
        expect(paths).toHaveLength(ARTICLE_PAGE_CAP * ARTICLE_PAGE_SIZE)
    })

    it("returns the empty list and logs when a source fails", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {})

        const paths = await fetchArticlePaths(
            async () => {
                throw new Error("upstream down")
            },
            stubSource([pageOf("update", 1)], []),
        )

        expect(paths).toEqual([])
        expect(logged).toHaveBeenCalled()
        logged.mockRestore()
    })

    it("returns the empty list when no API binding is present", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {})

        expect(await fetchArticlePaths()).toEqual([])
        expect(logged).toHaveBeenCalled()
        logged.mockRestore()
    })
})
