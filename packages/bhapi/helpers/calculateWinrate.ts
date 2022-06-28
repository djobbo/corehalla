export const calculateWinrate = (wins: number, games: number): number =>
    (games === 0 ? 0 : wins / games) * 100
