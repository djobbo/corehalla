import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { weaponIconSrc } from "@/lib/assets"
import { weaponHref, weaponIndex } from "@/lib/weapons"

export const WeaponIndex = () => (
    <main className="ch-page">
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Brawlhalla arsenal</p>
            <h1 className="ch-display mt-1 text-2xl">Weapons</h1>
            <p className="mt-1 text-xs text-muted-foreground">
                Every weapon in the game, with the legends that wield it.
            </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {weaponIndex().map(({ weapon, wielders }) => (
                <li key={weapon}>
                    <Link
                        to={weaponHref(weapon)}
                        className="block h-full transition-transform hover:-translate-y-0.5 focus-visible:outline-2"
                    >
                        <Card className="h-full py-0">
                            <span className="flex h-full items-center gap-3 p-3">
                                <img
                                    src={weaponIconSrc(weapon)}
                                    alt=""
                                    className="size-12 shrink-0 object-contain"
                                />
                                <span className="flex min-w-0 flex-col">
                                    <span className="font-semibold">
                                        {weapon}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {wielders
                                            .map((legend) => legend.bio_name)
                                            .join(" · ")}
                                    </span>
                                </span>
                            </span>
                        </Card>
                    </Link>
                </li>
            ))}
        </ul>
    </main>
)
