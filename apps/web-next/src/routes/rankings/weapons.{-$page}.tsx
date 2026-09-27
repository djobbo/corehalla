import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { GlobalRankingsView } from "@/components/GlobalRankingsView"
import { GLOBAL_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { weaponBoard } from "@/lib/globalRankings"
import { resolvePage, resolveWeapon, weaponOptions } from "@/lib/routeParams"
import {
    globalWeaponRankingsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"
import type { SortableWeaponProp } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

/**
 * One weapon's leaderboard.
 *
 * Reads `BHPlayerWeapon`, which the ingest materialises when it writes a
 * player's legends: the per-slot weapon columns are summed into per-weapon rows
 * once, at write time, rather than joined and aggregated on every request. That
 * is also why this board can only offer the columns that table stores — "damage
 * taken with Sword" is not a thing the ingest records, so it is not a sort here
 * either.
 *
 * One consequence worth knowing when reading the numbers: the ingest keeps a
 * player's three most-held weapons, so a board for a weapon someone dabbles in
 * shows only those who use it enough to be in their top three.
 */

type WeaponRankingsSearch = { weapon: Weapon; sortBy: SortableWeaponProp }

export const Route = createFileRoute("/rankings/weapons/{-$page}")({
    validateSearch: (
        search: Record<string, unknown>,
    ): WeaponRankingsSearch => ({
        weapon: resolveWeapon(search.weapon),
        sortBy: weaponBoard.sort(search.sortBy),
    }),
    loaderDeps: ({ search }) => ({
        weapon: search.weapon,
        sortBy: search.sortBy,
    }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            globalWeaponRankingsAtom(
                deps.weapon,
                deps.sortBy,
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const { weapon, sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const page = resolvePage(pageParam)
    const rows = useQuery(globalWeaponRankingsAtom(weapon, sortBy, page))

    const pageHref = (next: number) => {
        const query = `weapon=${encodeURIComponent(weapon)}&sortBy=${sortBy}`

        return next > 1
            ? `/rankings/weapons/${next}?${query}`
            : `/rankings/weapons?${query}`
    }

    const go = (search: WeaponRankingsSearch) =>
        void navigate({
            to: "/rankings/weapons/{-$page}",
            params: { page: undefined },
            search,
            replace: true,
        })

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Per weapon</p>
                <h1 className="ch-display mt-1 text-2xl">{weapon} rankings</h1>
                <p className="mt-1 text-xs text-textVar1">
                    Totals with this weapon · page {page}
                </p>
            </header>

            <GlobalRankingsView
                rows={rows}
                sortBy={sortBy}
                sorts={weaponBoard.sorts}
                onSortChange={(next) => go({ weapon, sortBy: next })}
                metric={weaponBoard.option(sortBy)}
                rankOffset={(page - 1) * GLOBAL_RANKINGS_PAGE_SIZE}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= GLOBAL_RANKINGS_PAGE_SIZE
                        ? pageHref(page + 1)
                        : undefined
                }
            />

            {/* Fifteen weapons, so the same chip row a legend's seventy get. */}
            <div className="mt-6">
                <p className="ch-stat-label">Weapon</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {weaponOptions.map((option) => {
                        const current = option.value === weapon

                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={current}
                                onClick={() =>
                                    go({ weapon: option.value, sortBy })
                                }
                                className={
                                    current
                                        ? "ch-chip ch-chip-on"
                                        : "ch-chip ch-chip-off"
                                }
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
