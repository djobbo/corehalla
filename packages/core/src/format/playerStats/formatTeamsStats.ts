import { getHeroRatingSquash } from '~calc'
import { cleanString } from '~util/cleanString'
import { regions } from '~static'
import { I2v2Team, I2v2TeamFormat } from '~types'

export const formatTeamsStats = (playerID: number, teamsStats: I2v2Team[]): I2v2TeamFormat[] => {
    return teamsStats
        .map<I2v2TeamFormat>(
            ({ brawlhalla_id_one, brawlhalla_id_two, teamname, region, global_rank: _, peak_rating, ...season }) => {
                const isPlayerOne = brawlhalla_id_one === playerID
                const playerNames = teamname.split('+')

                return {
                    playerAlias: cleanString(playerNames[+!isPlayerOne]),
                    teammate: {
                        id: isPlayerOne ? brawlhalla_id_two : brawlhalla_id_one,
                        name: cleanString(playerNames[+isPlayerOne]),
                    },
                    region: regions[region - 2],
                    season: {
                        ...season,
                        peak: peak_rating,
                        ratingSquash: getHeroRatingSquash(season.rating),
                    },
                }
            },
        )
        .reduce<I2v2TeamFormat[]>(
            (acc, x) => (acc.find((y) => y.teammate.id === x.teammate.id) ? acc : [...acc, x]),
            [],
        )
}
