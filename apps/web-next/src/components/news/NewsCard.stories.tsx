import type { Meta, StoryObj } from "@storybook/react-vite"
import { NewsCard, NewsHero } from "./NewsCard"
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
    categories: BHArticle["categories"] = [],
    excerpt = "",
): BHArticle => ({
    slug,
    title,
    dateGmt: "2026-10-13T09:30:00",
    excerpt,
    categories,
    featuredImage: image(slug),
})

const patchNotes = article(
    "patch-7-13",
    "Patch 7.13 brings a reworked Rocket Lance",
    [{ slug: "patch-notes", name: "Patch Notes" }],
    "Rocket Lance gets a full rework alongside a fresh round of legend balance changes and a new ranked season reward.",
)

const meta = {
    title: "Features/News/News card",
    component: NewsCard,
    decorators: [withRouter],
    parameters: { layout: "centered" },
} satisfies Meta<typeof NewsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { article: patchNotes } }

export const Featured: Story = {
    args: { article: patchNotes, variant: "featured" },
}

export const Compact: Story = {
    args: { article: patchNotes, variant: "compact", className: "w-96" },
}

export const Hero: Story = {
    args: { article: patchNotes },
    render: ({ article: heroArticle }) => (
        <div className="w-[44rem]">
            <NewsHero article={heroArticle} />
        </div>
    ),
}
