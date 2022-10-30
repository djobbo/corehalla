import { AppLink } from "ui/base/AppLink"
import { DiscordIcon, GithubIcon, TwitterIcon } from "ui/icons"
import { Tooltip } from "ui/base/Tooltip"

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

export const Footer = ({ className }) => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={className}>
            <p className="text-center text-xs border-t border-bg py-8">
                <span className="block max-w-screen-sm mx-auto">
                    Visual assets courtesy of{" "}
                    <AppLink
                        className="p-link"
                        href="https://www.bluemammoth.com"
                        target="_blank"
                    >
                        Blue Mammoth Games
                    </AppLink>{" "}
                    &{" "}
                    <AppLink
                        className="p-link"
                        href="https://www.flaticon.com/fr/packs/square-country-simple-flags"
                        target="_blank"
                    >
                        Freepik - Flaticon
                    </AppLink>
                    .
                    <br />
                    Corehalla is neither associated nor endorsed by Blue Mammoth
                    Games and doesn&apos;t reflect the views or opinions of Blue
                    Mammoth Games or anyone officially involved in developing
                    Brawlhalla.
                    <br />
                    Brawlhalla and Blue Mammoth Games are trademarks of{" "}
                    <a className="p-link" href="https://www.bluemammoth.com">
                        Blue Mammoth Games
                    </a>
                    .
                </span>
            </p>
            <div className="max-w-screen-lg mx-auto flex flex-col justify-center items-center border-t p-12 border-bg">
                <div className="flex items-center gap-8">
                    {socialLinks.map(({ Icon, href, name }) => (
                        <Tooltip content={name} key={name}>
                            <AppLink
                                href={href}
                                target="_blank"
                                className="text-textVar1 hover:text-text"
                            >
                                <Icon size={32} />
                            </AppLink>
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
