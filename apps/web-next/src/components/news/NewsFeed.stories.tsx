import type { Meta, StoryObj } from "@storybook/react-vite"
import { NewsFeed } from "./NewsFeed"
import { withRouter } from "@/storybook/decorators"
import type { BHArticle } from "@crh/api-contract/schemas"

/** Self-contained placeholder so cards render without a network fetch. */
const swatch = (label: string): string =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#26303d"/><text x="8" y="4.8" font-family="sans-serif" font-size="1.2" fill="#8b98a8" text-anchor="middle">${label}</text></svg>`,
    )}`

const image = (slug: string): BHArticle["featuredImage"] => ({
    sourceUrl: swatch(slug),
    mediaDetails: {
        width: 1600,
        height: 900,
        sizes: [
            {
                name: "medium",
                mimeType: "image/jpeg",
                sourceUrl: swatch("medium"),
                width: 300,
                height: 169,
            },
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
})

const article = (
    slug: string,
    title: string,
    categories: BHArticle["categories"],
    dateGmt = "2026-10-13T09:30:00",
    excerpt = "",
): BHArticle => ({
    slug,
    title,
    dateGmt,
    excerpt,
    categories,
    featuredImage: image(slug),
})

const patchNotes = [
    article(
        "patch-7-13",
        "Patch 7.13 brings a reworked Rocket Lance",
        [{ slug: "patch-notes", name: "Patch Notes" }],
        "2026-10-13T09:30:00",
        "Rocket Lance gets a full rework alongside a fresh round of legend balance changes.",
    ),
    article("patch-7-12", "Patch 7.12: orb tweaks and hitbox fixes", [
        { slug: "patch-notes", name: "Patch Notes" },
    ]),
    article("patch-7-11", "Patch 7.11 balance pass", [
        { slug: "patch-notes", name: "Patch Notes" },
    ]),
    article("patch-7-10", "Patch 7.10 adjustments", [
        { slug: "patch-notes", name: "Patch Notes" },
    ]),
    article("patch-7-09", "Patch 7.09 hotfix", [
        { slug: "patch-notes", name: "Patch Notes" },
    ]),
    article("patch-7-08", "Patch 7.08 notes", [
        { slug: "patch-notes", name: "Patch Notes" },
    ]),
]

const esports = [
    article("bcx-2026-recap", "BCX 2026 grand finals recap", [
        { slug: "esports", name: "Esports" },
    ]),
    article("midseason-madness", "Midseason Madness bracket revealed", [
        { slug: "esports", name: "Esports" },
    ]),
    article("na-summer-cup", "NA Summer Cup results", [
        { slug: "esports", name: "Esports" },
        { slug: "community", name: "Community" },
    ]),
    article("eu-open-finals", "EU Open finals recap", [
        { slug: "esports", name: "Esports" },
    ]),
]

const meta = {
    title: "Features/News/News feed",
    component: NewsFeed,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof NewsFeed>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPage: Story = {
    args: {
        category: "",
        page: 1,
        articles: patchNotes,
        hasNextPage: true,
    },
}

export const CategoryPage: Story = {
    args: {
        category: "esports",
        page: 2,
        articles: esports,
        hasNextPage: false,
    },
}

export const Empty: Story = {
    args: {
        category: "legends",
        page: 1,
        articles: [],
        hasNextPage: false,
    },
}
