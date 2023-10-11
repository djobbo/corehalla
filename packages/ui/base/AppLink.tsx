// eslint-disable-next-line no-restricted-imports
import Link from "next/link"
import type { AnchorHTMLAttributes } from "react"

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export const AppLink = ({ href, children, ...props }: AppLinkProps) => {
    return (
        <Link
            href={href}
            {...props}
            rel={props.target === "_blank" ? "noreferrer" : undefined}
            prefech={false}
        >
            {children}
        </Link>
    )
}
