import {
    createFileRoute,
    notFound,
    redirect,
    useNavigate,
} from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { WeaponView } from "@/components/weapon/WeaponView"
import { absoluteUrl } from "@/lib/assets"
import { weaponBoard } from "@/lib/careerRankings"
import { isMetaFloor, metaFloorSearch, resolveMetaFloor } from "@/lib/metaFloor"
import { resolveWeaponSlug, weaponHref } from "@/lib/weapons"
import {
    careerWeaponRankingsAtom,
    preloadAtomsDegraded,
    useQuery,
    weaponMetaAtom,
    weaponMetaQueryAtom,
} from "@/effect/atoms"
import type { MetaFloor } from "@crh/api-contract/schemas"

type WeaponSlugSearch = { floor?: MetaFloor }

export const Route = createFileRoute("/weapons/$slug")({
    // The floor lives in the URL, so a sliced page is shareable and a cold load
    // can be server-rendered from the same key the client hydrates.
    validateSearch: (search: Record<string, unknown>): WeaponSlugSearch =>
        isMetaFloor(search.floor) ? { floor: search.floor } : {},
    loaderDeps: ({ search }) => ({
        floor: resolveMetaFloor(search.floor),
    }),
    loader({ params, context, location, deps }) {
        const weapon = resolveWeaponSlug(params.slug)

        if (weapon === null) {
            throw notFound()
        }

        const href = weaponHref(weapon)

        if (location.pathname !== href) {
            throw redirect({
                href: `${href}${location.searchStr}${location.hash ? `#${location.hash}` : ""}`,
                statusCode: 301,
            })
        }

        return preloadAtomsDegraded(
            context,
            [careerWeaponRankingsAtom(weapon, weaponBoard.defaultSort, 1)],
            // Decoration: a failed aggregate hides the card, never the page.
            [weaponMetaQueryAtom(deps.floor)],
        )
    },
    head({ params }) {
        const weapon = resolveWeaponSlug(params.slug)

        if (weapon === null) return {}

        return {
            meta: [
                { title: `${weapon} — Brawlhalla weapon — Corehalla` },
                {
                    name: "description",
                    content: `${weapon} in Brawlhalla: the legends that wield it and the players with the most KOs using it.`,
                },
            ],
            links: [
                {
                    rel: "canonical",
                    href: absoluteUrl(weaponHref(weapon)),
                },
            ],
        }
    },
    component: Page,
})

function Page() {
    const { slug } = Route.useParams()
    const { floor: selected } = Route.useSearch()
    const floor = selected ?? "all"
    const navigate = useNavigate()
    const weapon = resolveWeaponSlug(slug)

    if (weapon === null) {
        throw notFound()
    }

    const rows = useQuery(
        careerWeaponRankingsAtom(weapon, weaponBoard.defaultSort, 1),
    )
    const meta = useAtomValue(weaponMetaAtom(floor))

    return (
        <WeaponView
            weapon={weapon}
            rows={rows}
            meta={meta}
            floor={floor}
            onFloorChange={(next) =>
                void navigate({
                    to: "/weapons/$slug",
                    params: { slug },
                    search: metaFloorSearch(next),
                    replace: true,
                })
            }
        />
    )
}
