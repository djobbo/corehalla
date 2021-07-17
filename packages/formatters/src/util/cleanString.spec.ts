import { cleanString } from './cleanString'

describe('util/cleanString', () => {
    it('cleans string', () => {
        //TODO: BETTER TEST
        expect(cleanString('abcde123')).toBe('abcde123')
    })
})
