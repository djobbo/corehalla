import { makeRegistry } from "@/effect/atoms"
import { RegistryContext } from "@effect/atom-react"
import {
    RouterContextProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router"
import type { Decorator } from "@storybook/react-vite"
import { Suspense, useMemo } from "react"

/**
 * Route paths the components under `src/components` actually link to, mirroring
 * `src/routes` (optional segments kept as `{-$param}`).
 *
 * Stories render a component directly rather than through its route, so the
 * router exists only to satisfy `Link`/`useNavigate`/`useLocation`. Registering
 * the paths keeps `Link` resolution real — a `to` the app does not ship still
 * fails loudly, which is the point of testing in isolation.
 */
const ROUTE_PATHS = [
    "/@me/favorites",
    "/leaderboard",
    "/news",
    "/news/$slug",
    "/news/category",
    "/news/category/$category/{-$page}",
    "/news/page/{-$page}",
    "/queue/{-$bracket}/{-$region}",
    "/rankings",
    "/rankings/1v1/{-$region}/{-$page}",
    "/rankings/2v2/{-$region}/{-$page}",
    "/rankings/3v3/{-$region}/{-$page}",
    "/rankings/career",
    "/rankings/career/legends/{-$legendId}/{-$page}",
    "/rankings/career/players/{-$page}",
    "/rankings/career/weapons/{-$weapon}/{-$page}",
    "/rankings/clans/{-$page}",
    "/rankings/global/{-$page}",
    "/rankings/guilds/{-$page}",
    "/rankings/legends/{-$page}",
    "/rankings/live/1v1/{-$region}/{-$page}",
    "/rankings/live/2v2/{-$region}/{-$page}",
    "/rankings/live/3v3/{-$region}/{-$page}",
    "/rankings/power/{-$gameMode}/{-$region}/{-$page}",
    "/rankings/queues/{-$bracket}/{-$region}",
    "/rankings/weapons/{-$page}",
    "/stats/clan/$",
    "/stats/guilds/$id",
    "/stats/player/$",
    "/stats/players/$id",
    "/stats/players/$id/2v2",
    "/stats/players/$id/esports",
    "/stats/players/$id/legends",
    "/stats/players/$id/weapons",
] as const

const buildRouter = () => {
    const rootRoute = createRootRoute()
    const routes = ROUTE_PATHS.map((path) =>
        createRoute({ getParentRoute: () => rootRoute, path }),
    )

    return createRouter({
        routeTree: rootRoute.addChildren(routes),
        history: createMemoryHistory({ initialEntries: ["/"] }),
        // The registered router context carries the atom registry; components
        // that read it (`Route.useRouteContext`) need it present.
        context: { registry: makeRegistry() },
    })
}

/**
 * Provides a real TanStack Router context without rendering any route, so a
 * component that calls `<Link>`, `useNavigate` or `useLocation` can be storied
 * on its own.
 */
export const withRouter: Decorator = (Story) => {
    const router = useMemo(buildRouter, [])

    return (
        <RouterContextProvider router={router}>
            <Story />
        </RouterContextProvider>
    )
}

/** Shaped to `SessionSchema`/`UserProfileSchema`. */
const MOCK_USER = {
    id: "usr_storybook",
    discordId: "102938475610293847",
    username: "Storybook",
    avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
    email: null,
}

/** Shaped to `FavoriteSchema[]`. */
const MOCK_FAVORITES = [
    { id: "1", type: "player", name: "Mordex", meta: {} },
    { id: "42", type: "clan", name: "Wolfpack", meta: {} },
]

const requestPath = (input: RequestInfo | URL): string => {
    const url =
        typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url

    return url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] ?? ""
}

/**
 * Extra `/api/v1/*` responses a story needs, keyed by pathname. Registered at
 * module load; the mock reads the map on every request, so ordering between
 * stories never matters.
 */
const mockRoutes = new Map<string, unknown>()

/** Serve `body` (JSON) for `path` inside `withMockApi`. */
export const registerMockRoute = (path: string, body: unknown): void => {
    mockRoutes.set(path, body)
}

let fetchMockInstalled = false

/**
 * Answers the account reads and any `registerMockRoute` entry, on top of the
 * real `fetch`. A path it does not know **falls through** rather than 404ing, so
 * stories stay composable — an unregistered profile fetch surfaces the
 * component's own error state instead of a mock's silent empty.
 */
const installFetchMock = () => {
    if (fetchMockInstalled) return
    fetchMockInstalled = true

    const original = globalThis.fetch.bind(globalThis)
    const json = (body: unknown) =>
        new Response(JSON.stringify(body), {
            status: 200,
            headers: { "content-type": "application/json" },
        })

    globalThis.fetch = (input, init) => {
        const path = requestPath(input)

        if (!path.startsWith("/api/v1/")) return original(input, init)

        if (mockRoutes.has(path)) {
            return Promise.resolve(json(mockRoutes.get(path)))
        }

        if (path === "/api/v1/me/session") {
            return Promise.resolve(json({ user: MOCK_USER }))
        }

        if (path === "/api/v1/me/favorites") {
            const method = (
                init?.method ??
                (input instanceof Request ? input.method : "GET")
            ).toUpperCase()

            return Promise.resolve(
                method === "GET"
                    ? json(MOCK_FAVORITES)
                    : new Response(null, { status: 204 }),
            )
        }

        return original(input, init)
    }
}

/**
 * Router + a fresh atom registry + the mocked API, inside the Suspense boundary
 * the data-reading atoms need. A fresh registry per story is what makes the
 * atoms refetch instead of replaying a neighbouring story's cache.
 */
export const withMockApi: Decorator = (Story) => {
    installFetchMock()
    const router = useMemo(buildRouter, [])
    const registry = useMemo(makeRegistry, [])

    return (
        <RouterContextProvider router={router}>
            <RegistryContext.Provider value={registry}>
                <Suspense fallback={null}>
                    <Story />
                </Suspense>
            </RegistryContext.Provider>
        </RouterContextProvider>
    )
}
