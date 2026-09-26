import { createFileRoute } from "@tanstack/react-router"
import { seoTags } from "@components/SEO"
import type { ReactNode } from "react"

/**
 * Privacy policy.
 *
 * A static, server-rendered page: no data, no client state. Keep it in sync
 * with what the app actually stores — account fields live in
 * `web/src/effect/Auth.ts`, cookies in `web/src/effect/cookies.ts`, and the
 * analytics/ad vendors in `web/src/lib/analytics`.
 */
export const Route = createFileRoute("/privacy")({
    ssr: true,
    head: () => ({
        meta: seoTags({
            title: "Privacy Policy • Corehalla",
            description:
                "What Corehalla collects, the cookies and third-party services it uses, and how to have your data removed.",
        }),
    }),
    component: PrivacyPage,
})

/** Update by hand when the text below changes; never derived from `Date`. */
const LAST_UPDATED = "September 24, 2026"

const Section = ({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) => (
    <section className="mt-8">
        <h2 className="text-2xl font-semibold border-b border-bg py-2">
            {title}
        </h2>
        <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
            {children}
        </div>
    </section>
)

function PrivacyPage() {
    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="mt-2 text-xs text-textVar1">
                Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-4 text-sm leading-relaxed">
                Corehalla is a fan-run stats site for Brawlhalla. It is not
                operated by, or affiliated with, Blue Mammoth Games. This page
                explains what is stored when you visit or sign in, which
                third-party services are involved, and how to have your data
                removed.
            </p>

            <Section title="What we collect">
                <p>
                    <strong>Browsing.</strong> Every request reaches our host,
                    Cloudflare, which processes standard server logs (IP
                    address, user agent, requested URL) to serve and protect the
                    site. We do not keep our own server-side access logs.
                </p>
                <p>
                    <strong>Signing in.</strong> Corehalla accounts are created
                    through Discord. When you sign in we store the Discord
                    profile fields Discord returns: your Discord user ID,
                    username, avatar URL, and email address if your Discord
                    account exposes one.
                </p>
                <p>
                    <strong>Using your account.</strong> Players and clans you
                    favourite are stored on our servers against your account so
                    they follow you between devices.
                </p>
                <p>
                    <strong>Local storage.</strong> Your browser stores a few
                    small preferences (for example that you have already
                    dismissed a popup). These never leave your device.
                </p>
            </Section>

            <Section title="Cookies">
                <ul className="list-disc pl-5 flex flex-col gap-2">
                    <li>
                        <code>corehalla_session</code> — set only when you sign
                        in, so you stay signed in. HttpOnly, and only a hash of
                        the token is stored on the server.
                    </li>
                    <li>
                        <code>corehalla_oauth_state</code> — short-lived (10
                        minutes), set during Discord sign-in to protect against
                        request forgery.
                    </li>
                    <li>
                        <code>_ga</code>, <code>_ga_*</code> — set by Google
                        Analytics when it is enabled, to distinguish visitors.
                    </li>
                    <li>
                        AdSense and its partners may set cookies to select and
                        measure ads. Those are controlled by Google, not by us.
                    </li>
                </ul>
                <p>
                    Cloudflare Web Analytics, which we use for cookieless
                    traffic statistics, sets no cookies at all.
                </p>
            </Section>

            <Section title="Third-party services">
                <p>
                    These services process data on our behalf or as independent
                    controllers. Each link goes to that provider's own privacy
                    policy.
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2">
                    <li>
                        <a
                            className="p-link"
                            href="https://www.cloudflare.com/privacypolicy/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Cloudflare
                        </a>{" "}
                        — hosting, the database, and Web Analytics.
                    </li>
                    <li>
                        <a
                            className="p-link"
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Google Analytics
                        </a>{" "}
                        — aggregate traffic statistics. Only loaded when a
                        tracking ID is configured.
                    </li>
                    <li>
                        <a
                            className="p-link"
                            href="https://policies.google.com/technologies/ads"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Google AdSense
                        </a>{" "}
                        — the ads that fund the site. Google may use your visits
                        to other sites to personalise them; you can manage that
                        in{" "}
                        <a
                            className="p-link"
                            href="https://myadcenter.google.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            My Ad Center
                        </a>
                        .
                    </li>
                    <li>
                        <a
                            className="p-link"
                            href="https://discord.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Discord
                        </a>{" "}
                        — sign-in, and the community server.
                    </li>
                    <li>
                        <a
                            className="p-link"
                            href="https://ko-fi.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ko-fi
                        </a>{" "}
                        — only if you choose to donate through our Ko-fi page.
                    </li>
                </ul>
            </Section>

            <Section title="Your choices and rights">
                <ul className="list-disc pl-5 flex flex-col gap-2">
                    <li>
                        Signing out clears the session cookie and removes the
                        session from our database.
                    </li>
                    <li>
                        You can block or delete cookies in your browser at any
                        time; the site works without them, you just will not
                        stay signed in.
                    </li>
                    <li>
                        You can ask us to delete your account and the data tied
                        to it. Ask in the{" "}
                        <a className="p-link" href="/discord">
                            Discord server
                        </a>{" "}
                        and we will remove it.
                    </li>
                    <li>
                        If you are in the EEA, the UK, or a region with similar
                        laws, you have the right to access, correct, export, or
                        erase your personal data, and to object to processing.
                        The same Discord request covers all of those.
                    </li>
                </ul>
            </Section>

            <Section title="Children">
                <p>
                    Corehalla is not directed at children under 13, and we do
                    not knowingly store their personal data. Sign-in happens
                    through Discord, which has its own minimum age in each
                    country.
                </p>
            </Section>

            <Section title="Changes">
                <p>
                    If this policy changes in a way that affects what is stored,
                    the date at the top of this page changes with it.
                </p>
            </Section>
        </div>
    )
}
