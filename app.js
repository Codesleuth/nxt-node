var NXT = require('./lib/nxt').NXT,
    debug = require('debug')('nxt-node'),
    async = require('async'),
    EventSource = require('eventsource'),
    account = require('./account'),
    PushListener = require('./lib/pushlistener').PushListener;

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

function startMotors(done) {
    nxt.startMotorA(function () {
        nxt.startMotorB(function () {
            debug('are motors A and B moving?');
            done();
        });
    });
}

function waitOneSecond(done) {
    setTimeout(function () {
        done();
    }, 1000);
}

function beep(done) {
    nxt.playtone(440, 500, function () {
        debug('can you hear me?');
        done();
    });
}

function allStop(done) {
    nxt.allStop(function () {
        debug('ALL STOP!');
        done();
    });
}

function run() {
    async.series([
        startMotors,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        waitOneSecond,
        //beep,
        allStop
    ]);
}

function handleMessage(msg) {
    if (msg.type !== 'inbound')
        return;

    var InboundMessage = msg.message.InboundMessage;

    debug('Received inbound push from %s with message "%s"', InboundMessage.From[0], InboundMessage.MessageText[0]);

    if (InboundMessage.From[0] == account.from && InboundMessage.MessageText[0] == account.message) {
        run();
    }
}

var listener = new PushListener(handleMessage);
listener.listen("http://push-codesleuth.rhcloud.com/listen/" + account.id);

var reconnectTimer = null;

function reconnect() {
    if (reconnectTimer != null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    debug('reconnecting...');
    reconnectTimer = setTimeout(function () {
        reconnectTimer = null;
        nxt.connect();
    }, 5000);
}

nxt.on('connect', function (error) {
    debug('NXT:connect: ', error);

    debug('stopping all motors');
    nxt.allStop();
});

nxt.on('disconnect', function () {
    debug('NXT:disconnect');
    reconnect();
});

nxt.on('error', function (err) {
    debug('NXT:error', err);
    reconnect();
});

nxt.connect();

process.on('SIGINT', function () {
    listener.deafen();
    nxt.disconnect();
});