var NXT = require('./lib/nxt').NXT,
    debug = require('debug')('nxt-node'),
    async = require('async'),
    EventSource = require('eventsource'),
    config = require('./config.json'),
    PushListener = require('./lib/pushlistener').PushListener,
    WebServer = require('./lib/webserver');

Array.prototype.any = function (verifier) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (verifier(this[i]) == true)
            return true;
    };
    return false;
};

Array.prototype.all = function (verifier) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (verifier(this[i]) == false)
            return false;
    };
    return true;
};

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

function noop() {};

function startMotors(done) {
    nxt.startMotorA(function () {
        nxt.startMotorB(function () {
            debug('are motors A and B moving?');
            done();
        });
    });
}

function startMotorsReverse(done) {
    nxt.startMotorAReverse(function () {
        nxt.startMotorBReverse(function () {
            debug('are motors A and B reversing?');
            done();
        });
    });
}

function waitOneSecond(done) {
    setTimeout(function () {
        done();
    }, 1000);
}

function wait(done) {
    setTimeout(function () {
        done();
    }, 20000);
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
        beep,
        waitOneSecond,
        startMotors,
        wait,
        allStop
    ]);
}

function handleMessage(msg) {
    if (msg.type !== 'inbound')
        return;

    var InboundMessage = msg.message.InboundMessage;
    var msg = InboundMessage.MessageText[0];

    debug('Received inbound push from %s with message "%s"', InboundMessage.From[0], msg);

    var parts = msg.split(' ');

    var matches = parts.length > 1
                  && parts[0].toUpperCase() == config.keyword.toUpperCase()
                  && parts[1].toUpperCase() == config.message.toUpperCase()
                  && config.from.any(function (e) {
                      return InboundMessage.From[0] == e;
                  });

    if (matches) {
        run();
    }
}

var listener = new PushListener(handleMessage);
listener.listen("http://push-codesleuth.rhcloud.com/listen/" + config.accountid);

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


var webServer = new WebServer();

webServer.on('forward', function () {
    startMotors(noop);
}).on('reverse', function () {
    startMotorsReverse(noop);
}).on('stop', function () {
    allStop(noop);
}).on('beep', function () {
    beep(noop);
});

webServer.listen();



process.on('SIGINT', function () {
    nxt.disconnect();
    webServer.deafen();
    listener.deafen();
});