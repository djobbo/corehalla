// export const Footer = () => {
//     return (
//         <footer className="p-12">
//             <div className="max-w-screen-lg mx-auto flex flex-col justify-center items-center border-t pt-12 border-bg">
//                 <p className="mr-1 text-xs text-textVar1">© 2022</p>
//                 <a
//                     className="font-bold hover:underline"
//                     href="https://djobbo.com"
//                     target="_blank"
//                     rel="noreferrer"
//                 >
//                     Djobbo Maïga
//                 </a>
//             </div>
//         </footer>
//     )
// }

import { Discord, Github, Twitter } from "@icons-pack/react-simple-icons"

const socialLinks = [
    {
        href: "https://twitter.com/Corehalla",
        Icon: Twitter,
    },
    {
        href: "https://github.com/djobbo/corehalla",
        Icon: Github,
    },
    {
        href: "https://discord.gg/eD248ez",
        Icon: Discord,
    },
]

export const Footer = ({ className }) => {
    return (
        <footer className={className}>
            <p className="text-center text-xs border-t border-bg py-8">
                <span className="block max-w-screen-sm mx-auto">
                    Visual assets courtesy of{" "}
                    <a className="p-link" href="https://www.bluemammoth.com">
                        Blue Mammoth Games
                    </a>
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
                    {socialLinks.map(({ Icon, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            key={href}
                            className="text-textVar1 hover:text-text"
                        >
                            <Icon size={32} />
                        </a>
                    ))}
                </div>
                <p className="mr-1 text-xs text-textVar1 mt-8">
                    © 2018-2022 Corehalla
                </p>
            </div>
        </footer>
    )
}
