import { createFileRoute } from "@tanstack/react-router"
import { preloadAtoms, rankings1v1Atom, useQuery } from "@/effect/atoms"

/**
 * Scaffold smoke test, deliberately undesigned.
 *
 * This route exists to prove the pipeline end to end — SSR, the Effect atom
 * registry, dehydration, and the typed client against the real contract — before
 * any interaction design is layered on. The next step replaces it with the
 * leaderboard-first home from the design.
 *
 * If rows render, everything below the design is working.
 */
export const Route = createFileRoute("/")({
    loader: ({ context }) =>
        preloadAtoms(context, [rankings1v1Atom("all", 1)]),
    component: Page,
})

function Page() {
    const rows = useQuery(rankings1v1Atom("all", 1))

    return (
        <main className="p-4">
            <h1 className="text-lg font-bold">Corehalla — UX study</h1>
            <p className="mt-2 text-sm text-textVar1">
                Scaffold check: {rows.length} rows from the 1v1 Global ladder.
            </p>
            <ol className="mt-4 flex flex-col">
                {rows.slice(0, 10).map((row) => (
                    <li key={row.brawlhalla_id} className="py-1">
                        {row.rank}. {row.name} — {row.rating}
                    </li>
                ))}
            </ol>
        </main>
    )
}
