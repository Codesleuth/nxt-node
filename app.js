var NXT = require('./lib/nxt').NXT,
    debug = require('debug')('nxt-node');

var port = process.argv[2] || 'COM3';
var nxt = new NXT(port);

function playtone() {
    nxt.playtone(440, 1000, function () {
        debug('can you hear me?');
    });

    setTimeout(function () {
        playtone();
    }, 2000);
}

nxt.connect(function () {
    playtone();
});

process.on('SIGINT', function () {
    nxt.disconnect();
});