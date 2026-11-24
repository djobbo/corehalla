import { ClientOnly, createFileRoute, notFound } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { VersusLoader, VersusView } from "@/components/views/VersusView"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import {
    dehydrateRegistry,
    playerProfileQueryAtom,
    preloadAtom,
} from "@/effect/atoms"
import { isNotFound } from "@/lib/routeErrors"
import type { DehydratedState } from "@/effect/atoms"

type VersusSearch = {
    readonly a?: string
    readonly b?: string
}

const resolveSlug = (value: unknown): string | undefined => {
    const slug = typeof value === "string" ? value.trim() : ""

    return slug === "" ? undefined : slug
}

export const Route = createFileRoute("/vs")({
    // Both players live in the URL so a comparison is shareable and the loader
    // can fetch both profiles before the first paint.
    validateSearch: (search: Record<string, unknown>): VersusSearch => ({
        a: resolveSlug(search.a),
        b: resolveSlug(search.b),
    }),
    loaderDeps: ({ search }) => ({ a: search.a, b: search.b }),
    async loader({ deps, context }) {
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
    component: Page,
})

const VersusShell = () => (
    <main id="main" tabIndex={-1} className="ch-page">
        <PageLoaderProbe />
    </main>
)

function PageContent() {
    const { a, b } = Route.useSearch()
    const aId = a === undefined ? null : parseEntityId(a)
    const bId = b === undefined ? null : parseEntityId(b)

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            {aId !== null && bId !== null ? (
                <VersusLoader aId={aId} bId={bId} aSlug={a} bSlug={b} />
            ) : (
                <VersusView a={null} b={null} aSlug={a} bSlug={b} />
            )}
        </main>
    )
}

function Page() {
    const { degraded } = Route.useLoaderData()

    if (degraded) {
        return (
            <ClientOnly fallback={<VersusShell />}>
                <PageContent />
            </ClientOnly>
        )
    }

    return <PageContent />
}
