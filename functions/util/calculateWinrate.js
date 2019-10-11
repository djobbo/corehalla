module.exports = (wins, games, digits) => {
    const precision = Math.pow(10, digits);
    return Math.round(wins / games * precision * 100) / precision
}