const axios = require('axios');

module.exports = (api_key, brawlhalla_id, dataType) => {
    return new Promise((resolve, reject) => {
        var URI = `https://api.brawlhalla.com/player/${brawlhalla_id}/${dataType}`;
        axios.get(URI, { params: { api_key } })
            .then(res => {
                if (res.status !== 200)
                    reject(`${res.status} • ${res.statusText}`);
                resolve(res.data);
            })
            .catch(err => reject());
    })
}