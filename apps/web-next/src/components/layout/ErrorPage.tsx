import { Link, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { discordUrl, githubUrl } from "@/lib/communityLinks"
import { errorPageFor, notFoundPage } from "@/lib/errorPage"
import type { ErrorPageContent } from "@/lib/errorPage"

type ErrorPageProps = {
    readonly page: ErrorPageContent
    readonly onRetry?: () => void
}

/**
 * The terminal screen for a 404 or a failed load. One component for both states:
 * the status decides the copy and the illustration, and only the failure carries
 * an action that re-runs the route.
 */
export const ErrorPage = ({ page, onRetry }: ErrorPageProps) => (
    <main
        id="main"
        tabIndex={-1}
        className="ch-page"
        aria-labelledby="error-page-title"
    >
        <section className="mx-auto flex max-w-3xl flex-col items-center py-10 text-center sm:py-16">
            <h1
                id="error-page-title"
                className="ch-display text-4xl sm:text-6xl"
            >
                {page.title}
            </h1>
            <p className="ch-kicker mt-3">Error {page.status}</p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                {page.description}
            </p>
            <img
                src={page.image}
                alt=""
                width={1381}
                height={870}
                loading="eager"
                className="mt-6 w-full max-w-2xl"
            />
            <div className="mt-8 flex flex-wrap justify-center gap-2">
                <Button size="lg" nativeButton={false} render={<Link to="/" />}>
                    Bring me home
                </Button>
                {onRetry !== undefined && (
                    <Button size="lg" variant="secondary" onClick={onRetry}>
                        Retry
                    </Button>
                )}
                <Button
                    size="lg"
                    variant="outline"
                    nativeButton={false}
                    render={
                        <a href={discordUrl} target="_blank" rel="noreferrer">
                            Report a bug on Discord
                        </a>
                    }
                />
                <Button
                    size="lg"
                    variant="outline"
                    nativeButton={false}
                    render={
                        <a href={githubUrl} target="_blank" rel="noreferrer">
                            Contribute on GitHub
                        </a>
                    }
                />
            </div>
        </section>
    </main>
)

export const NotFoundPage = () => <ErrorPage page={notFoundPage} />

type RouteErrorProps = {
    readonly error: unknown
}

/** A failed loader or render. `invalidate` re-runs it and resets the boundary. */
export const RouteErrorPage = ({ error }: RouteErrorProps) => {
    const router = useRouter()

    const page = errorPageFor(error)

    return (
        <ErrorPage
            page={page}
            onRetry={
                page.status === 500
                    ? () => {
                          void router.invalidate()
                      }
                    : undefined
            }
        />
    )
}
