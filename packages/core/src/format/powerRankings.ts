import type { IPowerRankingsFormat } from '~types'

export function formatPowerRankings(html: string): IPowerRankingsFormat[] {
    const table = html.substring(html.indexOf('<table '), html.indexOf('</table>'))
    const rows = table.split(/<\/tr><tr[a-zA-Z0-9=:;\-_" ]*>/)
    return rows.reduce<IPowerRankingsFormat[]>((acc, row, i) => {
        if (i < 3 || i === rows.length - 1) return acc

        const [, rank, socials, name, earnings, t8, t32, gold, silver, bronze] =
            row.split(/<\/td><td[a-zA-Z0-9=:;\-_" ]*>/)

        return [
            ...acc,
            {
                rank: parseInt(rank, 10),
                socials: {
                    twitch: (socials.match(/href="https:\/\/twitch\.tv\/[^"]+"/) || [undefined])[0],
                    twitter: (socials.match(/href="https:\/\/twitter\.com\/[^"]+"/) || [undefined])[0],
                },
                name,
                earnings: parseInt(earnings.substring(1), 10),
                t8: parseInt(t8, 10),
                t32: parseInt(t32, 10),
                medals: {
                    gold: parseInt(gold, 10),
                    silver: parseInt(silver, 10),
                    bronze: parseInt(bronze.replace(/<\/td>/g, ''), 10),
                },
            },
        ]
    }, [])
}
