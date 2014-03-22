var NXT = require('./lib/nxt').NXT,
    debug = require('debug')('nxt-node'),
    async = require('async');

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

function run() {
    async.series({
        startMotorA: function (done) {
            nxt.startMotorA(function () {
                debug('is motor A moving?');

                setTimeout(function () {
                    done();
                }, 3000);
            });
        },
        playtone: function (done) {
            nxt.playtone(440, 1000, function () {
                debug('can you hear me?');

                setTimeout(function () {
                    done();
                }, 3000);
            });
        },
        stopMotorA: function (done) {
            nxt.stopMotorA(function () {
                debug('is motor A stopping?');
                done();
            });
        },
        disconnect: function (done) {
            nxt.disconnect(done);
        }
    });
}

nxt.connect(run);

process.on('SIGINT', function () {
    nxt.disconnect();
});