import {
    attribution,
    communityLinks,
    disclaimer,
    trademark,
} from "@/lib/communityLinks"

type FooterProps = {
    readonly year: number
}

export const Footer = ({ year }: FooterProps) => (
    <footer className="ch-footer">
        <div className="ch-footer-inner">
            <div>
                <p className="ch-kicker">Join the community</p>
                <ul className="ch-footer-links">
                    {communityLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                className="ch-footer-link"
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ch-footer-legal">
                <p>{attribution}</p>
                <p>{disclaimer}</p>
                <p>{trademark}</p>
            </div>
            <p className="ch-footer-copy">© 2018-{year} Corehalla</p>
        </div>
    </footer>
)
