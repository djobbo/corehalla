import type { Decorator, Meta, StoryObj } from "@storybook/react-vite"
import { LandingHero } from "@/components/layout/LandingHero"
import { SearchProvider } from "@/components/layout/Search"
import { LatestNews } from "@/components/news/LatestNews"
import { LandingLadder } from "@/components/views/LandingLadder"
import { withRouter } from "@/storybook/decorators"
import type { BHArticle } from "@crh/api-contract/schemas"
import type { LadderRow } from "@/lib/ladderRows"

/** `LandingHero` embeds `SearchTrigger`, which requires the search provider. */
const withSearchProvider: Decorator = (Story) => (
    <SearchProvider>
        <Story />
    </SearchProvider>
)

const solo = (
    rank: number,
    name: string,
    slug: string,
    rating: number,
): LadderRow => ({
    key: slug,
    rank,
    rating,
    tier: rank === 1 ? "Valhallan" : "Diamond",
    members: [{ id: rank, name, slug }],
})

const rows: readonly LadderRow[] = [
    solo(1, "Mordex", "mordex", 2104),
    solo(2, "Sandstorm", "sandstorm", 2061),
    solo(3, "Boomie", "boomie", 1988),
    solo(4, "Lucians", "lucians", 1975),
    solo(5, "Kyna", "kyna", 1954),
    solo(6, "Ephidel", "ephidel", 1941),
]

const swatch = (label: string): string =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#26303d"/><text x="8" y="4.8" font-family="sans-serif" font-size="1.2" fill="#8b98a8" text-anchor="middle">${label}</text></svg>`,
    )}`

const article = (slug: string, title: string, excerpt = ""): BHArticle => ({
    slug,
    title,
    dateGmt: "2026-10-13T09:30:00",
    excerpt,
    categories: [{ slug: "patch-notes", name: "Patch Notes" }],
    featuredImage: {
        sourceUrl: swatch("large"),
        mediaDetails: {
            width: 1600,
            height: 900,
            sizes: [
                {
                    name: "medium_large",
                    mimeType: "image/jpeg",
                    sourceUrl: swatch("medium_large"),
                    width: 768,
                    height: 432,
                },
                {
                    name: "large",
                    mimeType: "image/jpeg",
                    sourceUrl: swatch("large"),
                    width: 1024,
                    height: 576,
                },
            ],
        },
    },
})

const articles: readonly BHArticle[] = [
    article(
        "patch-7-13",
        "Patch 7.13 brings a reworked Rocket Lance",
        "Rocket Lance gets a full rework alongside a fresh round of legend balance changes.",
    ),
    article("patch-7-12", "Patch 7.12: orb tweaks and hitbox fixes"),
    article("patch-7-11", "Patch 7.11 balance pass"),
]

/**
 * The landing page the route renders: hero, the two live ladders, then the
 * latest news.
 */
const meta = {
    title: "Views/Landing page",
    decorators: [withRouter, withSearchProvider],
    parameters: { layout: "fullscreen" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <main className="ch-page">
            <LandingHero />
            <section aria-labelledby="live-rankings">
                <p id="live-rankings" className="ch-kicker mt-8">
                    Live rankings
                </p>
                <div className="mt-2 grid gap-6 lg:grid-cols-2">
                    <LandingLadder bracket="1v1" rows={rows} />
                    <LandingLadder bracket="2v2" rows={rows} />
                </div>
            </section>
            <LatestNews articles={articles} />
        </main>
    ),
}
