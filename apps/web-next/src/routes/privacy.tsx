import { Link, createFileRoute } from "@tanstack/react-router"

/**
 * Static policy page: no loader, no atoms, no client state.
 *
 * Every claim here is backed by code: cookies in `apps/api/src/auth/cookies.ts`
 * and `apps/api/src/auth/handlers.ts`, favourites in the `me` API group,
 * recents in `src/effect/recents.ts`, and failure reports in
 * `src/effect/telemetry.ts`.
 */
export const Route = createFileRoute("/privacy")({
    head: () => ({
        meta: [
            { title: "Privacy Policy • Corehalla" },
            {
                name: "description",
                content:
                    "What Corehalla stores, the two cookies sign-in sets, and how to have your data removed.",
            },
        ],
    }),
    component: PrivacyPage,
})

/** Update by hand when the text changes; never derived from `Date`. */
const LAST_UPDATED = "November 23, 2026"

const Code = ({ children }: { readonly children: string }) => (
    <code className="bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
    </code>
)

function PrivacyPage() {
    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <article className="ch-article mx-auto max-w-3xl">
                <header className="ch-hero">
                    <p className="ch-kicker">Corehalla</p>
                    <h1 className="ch-display mt-1 text-2xl md:text-4xl">
                        Privacy Policy
                    </h1>
                </header>

                <p className="mt-3 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                    Last updated: {LAST_UPDATED}
                </p>

                <p>
                    Corehalla is a fan-run stats site for Brawlhalla. This page
                    says what the site stores, which cookies it sets, and how to
                    have your data removed. Browsing needs no account.
                </p>

                <h2>Who runs this site</h2>
                <p>
                    Corehalla is run by its maintainers as a fan project. It is
                    not operated by, endorsed by, or affiliated with Blue
                    Mammoth Games.
                </p>

                <h2>What the site stores</h2>
                <p>
                    <strong>Signing in.</strong> Accounts are created through
                    Discord. When you sign in we store the profile fields
                    Discord returns: your Discord user ID, username, avatar URL
                    and, if your Discord account exposes one, your email
                    address.
                </p>
                <p>
                    <strong>Favorites.</strong> Players and clans you favorite
                    are stored in our database against your account, so they
                    follow you between devices and browsers. Removing a favorite
                    deletes it.
                </p>
                <p>
                    <strong>Recent lookups.</strong> Your last eight player and
                    clan lookups are kept in your browser's local storage under{" "}
                    <Code>corehalla:recents</Code>, so the search box can offer
                    them again. They never leave your device.
                </p>
                <p>
                    <strong>Failure reports.</strong> When a stats request
                    cannot be served, the page sends a short same-origin report
                    to our own worker: which section failed, how long it took,
                    and a reason code. It carries no account, session or cookie
                    data and sets no cookie; it exists to spot upstream outages.
                </p>

                <h2>Cookies</h2>
                <p>
                    Sign-in sets two cookies. Both are HttpOnly, SameSite=Lax,
                    and limited to this site.
                </p>
                <ul>
                    <li>
                        <Code>corehalla_session</Code> — set when you finish
                        signing in, and expires 30 days after that. The cookie
                        holds an opaque token; the server stores only its
                        SHA-256 hash.
                    </li>
                    <li>
                        <Code>corehalla_oauth_state</Code> — set when you start
                        signing in and expires after 10 minutes, or as soon as
                        Discord sends you back. It protects the sign-in from
                        request forgery.
                    </li>
                </ul>
                <p>
                    No other cookies are set. This rewrite ships no advertising
                    and no analytics, so there are no advertising or analytics
                    cookies to set. Signing out or clearing cookies in your
                    browser removes both of the above.
                </p>

                <h2>Hosting</h2>
                <p>
                    Cloudflare serves these pages, runs the site's worker, and
                    hosts its database. Cloudflare processes each request — IP
                    address, user agent, requested URL — to deliver and protect
                    the site, under{" "}
                    <a
                        href="https://www.cloudflare.com/privacypolicy/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Cloudflare's own privacy policy
                    </a>
                    .
                </p>

                <h2>Your choices</h2>
                <ul>
                    <li>
                        Sign out from the account menu in the header. That
                        clears the session cookie and deletes the session from
                        our database; your favorites stay on the account for
                        your next sign-in.
                    </li>
                    <li>
                        Clear cookies and site data in your browser at any time.
                        The site still works, you just will not stay signed in
                        and your recent lookups reset.
                    </li>
                    <li>
                        To delete your account and everything tied to it — the
                        profile, its sessions and its favorites — ask in our{" "}
                        <Link to="/discord">Discord server</Link> and we will
                        remove it.
                    </li>
                    <li>
                        If you are in the EEA, the UK or a region with similar
                        laws, you have the right to access, correct, export or
                        erase your personal data and to object to its
                        processing. The same Discord request covers all of
                        those.
                    </li>
                </ul>

                <h2>Children</h2>
                <p>
                    Corehalla is not directed at children under 13, and we do
                    not knowingly store their personal data. Sign-in happens
                    through Discord, which sets its own minimum age in each
                    country.
                </p>

                <h2>Changes</h2>
                <p>
                    If what the site stores changes, this page and the date at
                    the top change with it.
                </p>
            </article>
        </main>
    )
}
