const axios = require('axios');

module.exports = (api_key, options = { bracket: '1v1', region: 'all', page: '1', name: '' }) => {
    return new Promise((resolve, reject) => {

        var URI = `https://api.brawlhalla.com/rankings/${options.bracket || '1v1'}/${options.region || 'all'}/${options.page || '1'}`;

        axios.get(URI, { params: { api_key, name: options.name || '' } })
            .then(res => {
                if (res.status === 200)
                    resolve(res.data);
                else
                    reject(`${res.status} • ${res.statusText}`);
            })
            .catch(console.error);
    })
}