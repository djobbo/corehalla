import { DiscordIcon, GithubIcon, TwitterIcon } from "ui/icons"
import { Tooltip } from "ui/base/Tooltip"
import { Trans } from "@lingui/macro"
import Link from "next/link"

const socialLinks = [
    {
        href: "/discord",
        Icon: DiscordIcon,
        name: "Discord",
    },
    {
        href: "/twitter",
        Icon: TwitterIcon,
        name: "Twitter",
    },
    {
        href: "/github",
        Icon: GithubIcon,
        name: "Github",
    },
]

type FooterProps = {
    className?: string
}

export const Footer = ({ className }: FooterProps) => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={className}>
            <p className="text-center text-xs border-t border-bg py-8">
                <span className="block max-w-screen-sm mx-auto">
                    Visual assets courtesy of{" "}
                    <Link
                        className="p-link"
                        href="https://www.bluemammoth.com"
                        target="_blank"
                    >
                        Blue Mammoth Games
                    </Link>{" "}
                    &{" "}
                    <Link
                        className="p-link"
                        href="https://www.flaticon.com/fr/packs/square-country-simple-flags"
                        target="_blank"
                    >
                        Freepik - Flaticon
                    </Link>
                    .
                    <br />
                    <Trans>
                        Corehalla is neither associated nor endorsed by Blue
                        Mammoth Games and doesn&apos;t reflect the views or
                        opinions of Blue Mammoth Games or anyone officially
                        involved in developing Brawlhalla.
                        <br />
                        Brawlhalla and Blue Mammoth Games are trademarks of{" "}
                    </Trans>
                    <a className="p-link" href="https://www.bluemammoth.com">
                        Blue Mammoth Games
                    </a>
                    .
                </span>
            </p>
            <div className="max-w-screen-lg mx-auto flex flex-col justify-center items-center border-t p-12 border-bg">
                <span className="text-sm">
                    <Trans>Join our community :</Trans>
                </span>
                <div className="flex items-center gap-8 mt-4">
                    {socialLinks.map(({ Icon, href, name }) => (
                        <Tooltip content={name} key={name}>
                            <Link
                                href={href}
                                target="_blank"
                                className="text-textVar1 hover:text-text"
                            >
                                <Icon size={32} />
                            </Link>
                        </Tooltip>
                    ))}
                </div>
                <p className="mr-1 text-xs text-textVar1 mt-8">
                    © 2018-{currentYear} Corehalla
                </p>
            </div>
        </footer>
    )
}
