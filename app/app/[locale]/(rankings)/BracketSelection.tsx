import { Paginator } from "ui/base/Paginator"
import { type ReactNode } from "react"

const getRankedPages = (region?: string, isRanked?: boolean) => {
    const showRegion = isRanked && !!region && region !== "all"
    const regionSuffix = showRegion ? `/${region}` : ""

    return [
        {
            id: "1v1",
            href: `/ranked/1v1${regionSuffix}`,
        },
        {
            id: "2v2",
            href: `/ranked/2v2${regionSuffix}`,
        },
        {
            id: "rotating",
            href: `/ranked/rotating${regionSuffix}`,
            label: "Rotating",
        },
    ]
}

const getPowerPages = (region?: string, isPower?: boolean) => {
    const showRegion = isPower && !!region
    const regionSuffix = showRegion ? `/${region}` : "/na"

    return [
        {
            id: "power1v1",
            href: `/power-rankings/1v1${regionSuffix}`,
            label: "Power 1v1",
        },
        {
            id: "power2v2",
            href: `/power-rankings/2v2${regionSuffix}`,
            label: "Power 2v2",
        },
    ]
}

type BracketSelectionProps = {
    isRanked?: boolean
    isPower?: boolean
    region?: string
    children?: ReactNode
}

export const BracketSelection = ({
    isRanked,
    isPower,
    region,
    children,
}: BracketSelectionProps) => {
    return (
        <div className="w-full flex flex-row sm:flex-col items-center justify-center gap-2">
            <Paginator
                pages={[
                    ...getRankedPages(region, isRanked),
                    {
                        id: "clans",
                        href: `/clans`,
                        label: "Clans",
                    },
                    ...getPowerPages(region, isPower),
                ]}
                responsive
            />
            {children}
        </div>
    )
}
