const fetchPlayerById = require('./fetchPlayerById');

module.exports = (api_key, brawlhalla_id) => {
    return new Promise((resolve, reject) => {
        fetchPlayerById(api_key, brawlhalla_id, 'stats')
            .then(resolve)
            .catch(console.error)
    })
}