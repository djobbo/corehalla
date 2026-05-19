// eslint-disable-next-line no-restricted-imports
import { Link } from "@tanstack/react-router"
import type { AnchorHTMLAttributes } from "react"

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export const AppLink = ({ href, children, ...props }: AppLinkProps) => {
    return (
        <Link
            to={href}
            {...props}
            rel={props.target === "_blank" ? "noreferrer" : undefined}
        >
            {children}
        </Link>
    )
}
