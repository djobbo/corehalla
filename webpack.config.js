const clientConfig = require('./webpack/client.prod.config');
const serverConfig = require('./webpack/server.prod.config');

module.exports = [clientConfig, serverConfig];
