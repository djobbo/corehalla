import { describe, expect, it } from "@effect/vitest"
import { sanitizeArticleHtml } from "@crh/web-parser/common"

describe("sanitizeArticleHtml", () => {
    it("removes scripts and their contents", () => {
        const html = sanitizeArticleHtml("<p>hi</p><script>alert(1)</script>")

        expect(html).toContain("<p>hi</p>")
        expect(html).not.toContain("alert")
        expect(html).not.toContain("<script")
    })

    it("strips event handlers", () => {
        const html = sanitizeArticleHtml(
            '<img src="https://cms.brawlhalla.com/a.png" onerror="alert(1)">',
        )

        expect(html).not.toContain("onerror")
        expect(html).toContain("a.png")
    })

    it("unwraps a link with a javascript: href", () => {
        const html = sanitizeArticleHtml('<a href="javascript:alert(1)">x</a>')

        expect(html).not.toContain("javascript:")
        expect(html).not.toContain("<a")
        expect(html).toContain("x")
    })

    it("keeps images, srcset, dimensions and safe links", () => {
        const html = sanitizeArticleHtml(
            '<p><a href="https://brawlhalla.com/x">link</a>' +
                '<img src="https://cms.brawlhalla.com/a.png" ' +
                'srcset="https://cms.brawlhalla.com/a-300.png 300w" ' +
                'alt="a" width="10" height="10"></p>',
        )

        expect(html).toContain('href="https://brawlhalla.com/x"')
        expect(html).toContain('src="https://cms.brawlhalla.com/a.png"')
        expect(html).toContain("srcset=")
        expect(html).toContain('alt="a"')
    })

    it("marks external links as noopener", () => {
        const html = sanitizeArticleHtml(
            '<a href="https://example.com/x">x</a>',
        )

        expect(html).toContain('rel="noopener noreferrer"')
        expect(html).toContain('target="_blank"')
    })

    it("unwraps unknown tags but keeps their text", () => {
        const html = sanitizeArticleHtml(
            "<p>before <custom>inside</custom> after</p>",
        )

        expect(html).toContain("inside")
        expect(html).not.toContain("custom")
    })

    it("drops disallowed iframes and keeps known embed hosts", () => {
        const bad = sanitizeArticleHtml(
            '<iframe src="https://evil.example.com/x"></iframe>',
        )

        expect(bad).not.toContain("<iframe")

        const good = sanitizeArticleHtml(
            '<iframe src="https://www.youtube.com/embed/abc"></iframe>',
        )

        expect(good).toContain("youtube.com/embed/abc")
    })

    it("removes comments", () => {
        const html = sanitizeArticleHtml("<p>a</p><!-- secret --><p>b</p>")

        expect(html).not.toContain("secret")
        expect(html).toContain("<p>a</p>")
    })

    it("drops data: image sources", () => {
        const html = sanitizeArticleHtml(
            '<img src="data:image/svg+xml;base64,AAAA">',
        )

        expect(html).not.toContain("data:")
    })
})
