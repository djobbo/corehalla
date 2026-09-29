import type { PaginatorPage } from "ui/base/Paginator"

export const rankingsBrackets: PaginatorPage[] = [
    { page: "1v1" },
    { page: "2v2" },
    { page: "power/1v1", label: "Power 1v1" },
    { page: "power/2v2", label: "Power 2v2" },
    { page: "clans", label: "Clans" },
]

export const rankingsRegions: PaginatorPage[] = [
    { page: "all", label: "Global" },
    { page: "us-e", label: "US-E" },
    { page: "eu", label: "EU" },
    { page: "sea", label: "SEA" },
    { page: "brz", label: "BRZ" },
    { page: "aus", label: "AUS" },
    { page: "us-w", label: "US-W" },
    { page: "jpn", label: "JPN" },
    { page: "sa", label: "SA" },
    { page: "me", label: "ME" },
]

export const powerRankingsRegions: PaginatorPage[] = [
    { page: "us-e", label: "NA" },
    { page: "eu", label: "EU" },
    { page: "sea", label: "SEA" },
    { page: "brz", label: "BRZ" },
    { page: "aus", label: "AUS" },
]
