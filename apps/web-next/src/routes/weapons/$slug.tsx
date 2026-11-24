import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { WeaponView } from "@/components/weapon/WeaponView"
import { absoluteUrl } from "@/lib/assets"
import { weaponBoard } from "@/lib/careerRankings"
import { resolveWeaponSlug, weaponHref } from "@/lib/weapons"
import {
    careerWeaponRankingsAtom,
    preloadAtomsDegraded,
    useQuery,
    weaponMetaAtom,
    weaponMetaQueryAtom,
} from "@/effect/atoms"

export const Route = createFileRoute("/weapons/$slug")({
    loader({ params, context, location }) {
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
            [weaponMetaQueryAtom()],
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
    const weapon = resolveWeaponSlug(Route.useParams().slug)

    if (weapon === null) {
        throw notFound()
    }

    const rows = useQuery(
        careerWeaponRankingsAtom(weapon, weaponBoard.defaultSort, 1),
    )
    const meta = useAtomValue(weaponMetaAtom())

    return <WeaponView weapon={weapon} rows={rows} meta={meta} />
}
