import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { legendHref } from "@/lib/legends"
import { LegendIcon } from "./LegendIcon"
import { legends } from "@crh/bhapi/legends"
import type { ReactNode } from "react"

export const LegendIndex = ({
    children,
}: {
    readonly children?: ReactNode
}) => (
    <main id="main" tabIndex={-1} className="ch-page">
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Brawlhalla roster</p>
            <h1 className="ch-display mt-1 text-2xl">Legends</h1>
            <p className="mt-1 text-xs text-muted-foreground">
                Every legend in the roster, with the weapons they carry.
            </p>
        </header>

        {children}

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {legends.map((legend) => (
                <li key={legend.legend_id}>
                    <Link
                        to={legendHref(legend)}
                        className="block h-full transition-transform hover:-translate-y-0.5 focus-visible:outline-2"
                    >
                        <Card className="h-full py-0">
                            <span className="flex h-full items-center gap-3 p-3">
                                <LegendIcon
                                    legend={legend}
                                    className="size-12 shrink-0 object-contain"
                                />
                                <span className="flex min-w-0 flex-col">
                                    <span className="font-semibold">
                                        {legend.bio_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {legend.weapon_one} ·{" "}
                                        {legend.weapon_two}
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
