const moment = require('moment');
const moment_format = require('moment-duration-format');

module.exports = (duration) => {
    if (duration === undefined)
        return 'N/A';
    if (duration <= 0)
        return '0s';
    return moment.duration(duration, 'seconds').format('hh[h] mm[m] ss[s]');
}