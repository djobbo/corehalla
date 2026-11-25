import {
    ClientOnly,
    createFileRoute,
    notFound,
    redirect,
} from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LegendVersusView } from "@/components/views/LegendVersusView"
import { VersusLoader, VersusView } from "@/components/views/VersusView"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import {
    dehydrateRegistry,
    legendMetaAtom,
    legendMetaQueryAtom,
    playerProfileQueryAtom,
    preloadAtom,
    preloadAtomsDegraded,
} from "@/effect/atoms"
import { absoluteUrl } from "@/lib/assets"
import { legendSlug, resolveLegend } from "@/lib/legends"
import { isNotFound } from "@/lib/routeErrors"
import type { DehydratedState } from "@/effect/atoms"

type VersusSearch = {
    readonly type?: "legends"
    readonly a?: string
    readonly b?: string
}

const resolveSlug = (value: unknown): string | undefined => {
    const slug = typeof value === "string" ? value.trim() : ""

    return slug === "" ? undefined : slug
}

const versusPath = (search: VersusSearch): string => {
    const params = new URLSearchParams()

    if (search.type === "legends") params.set("type", "legends")
    if (search.a !== undefined) params.set("a", search.a)
    if (search.b !== undefined) params.set("b", search.b)

    const query = params.toString()

    return query === "" ? "/vs" : `/vs?${query}`
}

export const Route = createFileRoute("/vs")({
    // Both sides live in the URL so a comparison is shareable and the loader
    // can fetch the data before the first paint.
    validateSearch: (search: Record<string, unknown>): VersusSearch => ({
        type: search.type === "legends" ? "legends" : undefined,
        a: resolveSlug(search.a),
        b: resolveSlug(search.b),
    }),
    loaderDeps: ({ search }) => ({
        type: search.type,
        a: search.a,
        b: search.b,
    }),
    async loader({ deps, context }) {
        if (deps.type === "legends") {
            const aLegend = deps.a === undefined ? null : resolveLegend(deps.a)
            const bLegend = deps.b === undefined ? null : resolveLegend(deps.b)

            if (
                (deps.a !== undefined && aLegend === null) ||
                (deps.b !== undefined && bLegend === null)
            ) {
                throw notFound()
            }

            // A bare id still resolves, but the minted slug is the one address
            // a shared link should carry.
            const canonical: VersusSearch = {
                type: "legends",
                a: aLegend === null ? undefined : legendSlug(aLegend),
                b: bLegend === null ? undefined : legendSlug(bLegend),
            }

            if (canonical.a !== deps.a || canonical.b !== deps.b) {
                throw redirect({ href: versusPath(canonical), statusCode: 301 })
            }

            // Decoration: the attributes compare even when the aggregate is late,
            // and a one-sided view can prefetch the sample while it is picked.
            return preloadAtomsDegraded(
                context,
                [],
                [legendMetaQueryAtom("all")],
            )
        }

        const aId = deps.a === undefined ? null : parseEntityId(deps.a)
        const bId = deps.b === undefined ? null : parseEntityId(deps.b)

        if (
            (deps.a !== undefined && aId === null) ||
            (deps.b !== undefined && bId === null)
        ) {
            throw notFound()
        }

        // One side alone is the picker's starting point, not a comparison.
        if (aId === null || bId === null) {
            return { dehydrated: [] as DehydratedState, degraded: false }
        }

        let degraded = false

        try {
            await Promise.all([
                preloadAtom(context.registry, playerProfileQueryAtom(aId)),
                preloadAtom(context.registry, playerProfileQueryAtom(bId)),
            ])
        } catch (error) {
            if (isNotFound(error)) throw notFound()

            degraded = true
        }

        return import.meta.env.SSR
            ? {
                  dehydrated: degraded
                      ? []
                      : dehydrateRegistry(context.registry),
                  degraded,
              }
            : { dehydrated: [] as DehydratedState, degraded }
    },
    head({ match }) {
        const { type, a, b } = match.search
        const path = versusPath(match.search)
        const aLegend = a === undefined ? null : resolveLegend(a)
        const bLegend = b === undefined ? null : resolveLegend(b)
        const bothLegends = aLegend !== null && bLegend !== null

        const legends = type === "legends"

        return {
            meta: [
                {
                    title: legends
                        ? bothLegends
                            ? `${aLegend.bio_name} vs ${bLegend.bio_name} — Legend comparison — Corehalla`
                            : "Compare legends — Corehalla"
                        : "Compare players — Corehalla",
                },
                {
                    name: "description",
                    content: legends
                        ? "Two Brawlhalla legends side by side: attributes, play share, win rate and per-game play style from Corehalla's indexed accounts."
                        : "Two players side by side: career totals, ranked rating and this season's numbers.",
                },
            ],
            links: [{ rel: "canonical", href: absoluteUrl(path) }],
        }
    },
    component: Page,
})

const VersusShell = () => (
    <main id="main" tabIndex={-1} className="ch-page">
        <PageLoaderProbe />
    </main>
)

const LegendsPage = () => {
    const { a, b } = Route.useSearch()
    const aLegend = a === undefined ? null : resolveLegend(a)
    const bLegend = b === undefined ? null : resolveLegend(b)
    const meta = useAtomValue(legendMetaAtom("all"))

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <LegendVersusView a={aLegend} b={bLegend} meta={meta} />
        </main>
    )
}

const PlayersPage = ({
    aId,
    bId,
    aSlug,
    bSlug,
}: {
    readonly aId: number | null
    readonly bId: number | null
    readonly aSlug?: string | undefined
    readonly bSlug?: string | undefined
}) => (
    <main id="main" tabIndex={-1} className="ch-page">
        {aId !== null && bId !== null ? (
            <VersusLoader aId={aId} bId={bId} aSlug={aSlug} bSlug={bSlug} />
        ) : (
            <VersusView a={null} b={null} aSlug={aSlug} bSlug={bSlug} />
        )}
    </main>
)

function Page() {
    const { type, a, b } = Route.useSearch()
    const { degraded } = Route.useLoaderData()

    if (type === "legends") return <LegendsPage />

    const aId = a === undefined ? null : parseEntityId(a)
    const bId = b === undefined ? null : parseEntityId(b)

    if (degraded) {
        return (
            <ClientOnly fallback={<VersusShell />}>
                <PlayersPage aId={aId} bId={bId} aSlug={a} bSlug={b} />
            </ClientOnly>
        )
    }

    return <PlayersPage aId={aId} bId={bId} aSlug={a} bSlug={b} />
}
