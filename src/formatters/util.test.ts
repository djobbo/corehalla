import { cleanString } from './util';

const testStrings = [
    ['qwerty', 'qwerty'],
    ['JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B', 'JavaScript_шеллы'],
    ['%E0%A4%A', '%E0%A4%A'],
    ['search+query%20%28correct%29', 'search+query (correct)'],
];

test('Correct Clan Format', () => {
    testStrings.forEach(([base, decoded]) => {
        expect(cleanString(base)).toBe(decoded);
    });
});
