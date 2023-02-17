
$ = require("jquery");

window.Nightscout = {
    client: require('../lib/client/clock-client'),
    clientUtils: require('../lib/client/clock-client-utils'),
    units: require('../lib/units')(),
};

console.info('Nightscout clock bundle ready');
