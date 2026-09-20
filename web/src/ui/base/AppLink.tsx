import { Link } from "@tanstack/react-router"
import type { AnchorHTMLAttributes } from "react"

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string
}

const isExternalHref = (href: string) =>
    /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("/")

/**
 * Framework-agnostic replacement for the previous `next/link` wrapper.
 *
 * Internal links keep client-side navigation through TanStack Router's `Link`.
 * External URLs, protocol links, and links that intentionally open a new tab
 * fall back to a plain anchor so they keep their native behaviour.
 */
export const AppLink = ({
    href,
    children,
    target,
    rel,
    ...props
}: AppLinkProps) => {
    if (isExternalHref(href) || target === "_blank") {
        return (
            <a
                href={href}
                target={target}
                rel={target === "_blank" ? "noreferrer" : rel}
                {...props}
            >
                {children}
            </a>
        )
    }

    return (
        // `to` accepts a concrete pathname at runtime; the cast keeps the
        // generated route-tree literal types from rejecting dynamic strings.
        <Link to={href as never} target={target} rel={rel} {...props}>
            {children}
        </Link>
    )
}
