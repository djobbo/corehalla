import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CareerRankingsView } from "@/components/views/CareerRankingsView"
import { CAREER_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { weaponBoard } from "@/lib/careerRankings"
import { resolvePage, resolveWeapon, weaponOptions } from "@/lib/routeParams"
import { cn } from "@/lib/cn"
import {
    careerWeaponRankingsAtom,
    preloadAtoms,
    useQuery,
} from "@/effect/atoms"
import type { SortableWeaponProp } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

type WeaponRankingsSearch = { sortBy: SortableWeaponProp }

export const Route = createFileRoute(
    "/rankings/career/weapons/{-$weapon}/{-$page}",
)({
    validateSearch: (
        search: Record<string, unknown>,
    ): WeaponRankingsSearch => ({
        sortBy: weaponBoard.sort(search.sortBy),
    }),
    loaderDeps: ({ search }) => ({ sortBy: search.sortBy }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            careerWeaponRankingsAtom(
                resolveWeapon(params.weapon),
                deps.sortBy,
                resolvePage(params.page),
            ),
        ]),
    component: Page,
})

function Page() {
    const { weapon: weaponParam, page: pageParam } = Route.useParams()
    const { sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const weapon = resolveWeapon(weaponParam)
    const page = resolvePage(pageParam)
    const rows = useQuery(careerWeaponRankingsAtom(weapon, sortBy, page))

    const pageHref = (next: number) =>
        (next > 1
            ? `/rankings/career/weapons/${encodeURIComponent(weapon)}/${next}`
            : `/rankings/career/weapons/${encodeURIComponent(weapon)}`) +
        `?sortBy=${sortBy}`

    const go = (weapon: Weapon, sortBy: SortableWeaponProp) =>
        void navigate({
            to: "/rankings/career/weapons/{-$weapon}/{-$page}",
            params: { weapon, page: undefined },
            search: { sortBy },
            replace: true,
        })

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Per weapon</p>
                <h1 className="ch-display mt-1 text-2xl">{weapon} rankings</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Totals with this weapon · page {page}
                </p>
            </header>
            <CareerRankingsView
                rows={rows}
                sortBy={sortBy}
                sorts={weaponBoard.sorts}
                onSortChange={(next) => go(weapon, next)}
                metric={weaponBoard.option(sortBy)}
                rankOffset={(page - 1) * CAREER_RANKINGS_PAGE_SIZE}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= CAREER_RANKINGS_PAGE_SIZE
                        ? pageHref(page + 1)
                        : undefined
                }
            />
            <fieldset className="mt-6 min-w-0">
                <legend className="ch-stat-label">Weapon</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {weaponOptions.map((option) => {
                        const current = option.value === weapon

                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={current}
                                onClick={() => go(option.value, sortBy)}
                                className={cn(
                                    "ch-chip",
                                    current ? "ch-chip-on" : "ch-chip-off",
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </fieldset>
        </main>
    )
}
