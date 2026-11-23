import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { TierBoard } from "@/components/tiers/TierBoard"
import { absoluteUrl } from "@/lib/assets"
import {
    canonicalTierSearch,
    decodeTierBoard,
    encodeTierBoard,
    placeLegend,
    type TierName,
} from "@/lib/tierList"

type TierSearch = { readonly t?: string }

export const Route = createFileRoute("/tiers")({
    validateSearch: (search: Record<string, unknown>): TierSearch => ({
        t: canonicalTierSearch(search.t),
    }),
    head: () => ({
        meta: [
            { title: "Legend tier list maker — Corehalla" },
            {
                name: "description",
                content:
                    "Rank every Brawlhalla legend from S to F, then share the board with one link. Drag, drop or use the keyboard; nothing leaves your browser.",
            },
        ],
        links: [{ rel: "canonical", href: absoluteUrl("/tiers") }],
    }),
    component: Page,
})

function Page() {
    const { t } = Route.useSearch()
    const navigate = useNavigate()
    const board = decodeTierBoard(t)

    const place = (legendId: number, tier: TierName | null) => {
        void navigate({
            to: "/tiers",
            search: {
                t: canonicalTierSearch(
                    encodeTierBoard(placeLegend(board, legendId, tier)),
                ),
            },
            replace: true,
        })
    }

    return (
        <TierBoard
            board={board}
            onPlace={place}
            onReset={() =>
                void navigate({ to: "/tiers", search: {}, replace: true })
            }
        />
    )
}
