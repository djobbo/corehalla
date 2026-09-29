import { createFileRoute, redirect } from "@tanstack/react-router"
import { resolvePage, resolveWeapon } from "@/lib/routeParams"

/**
 * The old address of the per-weapon board.
 *
 * Weapons used to be a filter on a shared `/rankings/weapons` page, selected by
 * `?weapon=`. They live at `/rankings/career/weapons/:weapon` now, so this
 * exists to keep the indexed URLs working: the weapon is folded into the path
 * (and the old query value honoured) while a 308 marks the new address
 * canonical.
 */

type LegacyWeaponSearch = {
    weapon?: string | undefined
    sortBy?: string | undefined
}

export const Route = createFileRoute("/rankings/weapons/{-$page}")({
    validateSearch: (search: Record<string, unknown>): LegacyWeaponSearch => ({
        weapon: typeof search.weapon === "string" ? search.weapon : undefined,
        sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
    }),
    beforeLoad({ params, search }) {
        const weapon = resolveWeapon(search.weapon)
        const page = resolvePage(params.page)
        const suffix = search.sortBy
            ? `?sortBy=${encodeURIComponent(search.sortBy)}`
            : ""

        throw redirect({
            href:
                (page > 1
                    ? `/rankings/career/weapons/${encodeURIComponent(weapon)}/${page}`
                    : `/rankings/career/weapons/${encodeURIComponent(weapon)}`) +
                suffix,
            statusCode: 308,
        })
    },
})
