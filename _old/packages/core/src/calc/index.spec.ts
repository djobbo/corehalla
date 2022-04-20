import {
    getGloryFromBestRating,
    getGloryFromWins,
    // getHeroRatingSquash,
    // getPersonalRatingSquash,
    // getTierFromRating,
} from '.'

describe('~calc', (): void => {
    it('calculates glory from wins', (): void => {
        expect(getGloryFromWins(10)).toBe(200)
        expect(getGloryFromWins(38)).toBe(760)
        expect(getGloryFromWins(251)).toBe(3527)
        expect(getGloryFromWins(1007)).toBe(5157)
    })

    it('calculates glory from best rating', (): void => {
        expect(getGloryFromBestRating(10)).toBe(250)
        expect(getGloryFromBestRating(200)).toBe(250)
        expect(getGloryFromBestRating(1200)).toBe(250)
        expect(getGloryFromBestRating(1254)).toBe(720)
        expect(getGloryFromBestRating(1537)).toBe(2442)
        expect(getGloryFromBestRating(1742)).toBe(3265)
        expect(getGloryFromBestRating(1999)).toBe(4365)
        expect(getGloryFromBestRating(2000)).toBe(4370)
        expect(getGloryFromBestRating(3011)).toBe(5155)
    })
})
