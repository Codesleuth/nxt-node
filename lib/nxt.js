var nxtlib = require('./nxtlib'),
    Motor = require('./motor').Motor,
    utils = require('./utils'),
    SerialPort = require("serialport").SerialPort,
    debug = require('debug')('NXT'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

function patchEmitter(emitter) {
    var oldEmit = emitter.emit;

    emitter.emit = function() {
        emitArgs = Array.prototype.slice.call(arguments, 0);
        debug("emitArgs: ", emitArgs);
        oldEmit.apply(emitter, arguments);
    }
}

function handleDataEvent(data) {
    var $this = this.NXT;

    $this.lastData = data;

    var responseData = data.slice(2);
    debug('data received (%d bytes): ', responseData.length, responseData);

    var dataHeader = data.slice(0, 2);
    debug('data header (%d bytes): ', dataHeader.length, dataHeader);

    if (responseData[2] > 0)
        debug("Error in response: %d", responseData[2]);

    $this.emit('data', data);
};

function handleOpenEvent() {
    var $this = this.NXT;

    $this.serialPort = this;

    debug('openned %s', $this.comport);
    $this.emit('connect');
};

function handleCloseEvent() {
    var $this = this.NXT;

    if ($this.serialPort != null) {
        $this.serialPort = null;

        debug('closed connection to %s', $this.comport);
        $this.emit('disconnect');
    }
};

function handleErrorEvent(err) {
    var $this = this.NXT;

    if ($this.serialPort != null) {
        $this.serialPort = null;

        debug("SerialPort error: ", err);
        $this.emit('error', err);
    }
};

function handleEndEvent() {
    var $this = this.NXT;

    if ($this.serialPort != null) {
        $this.serialPort = null;

        debug("SerialPort connection ended");
        $this.emit('end');
    }
};





var NXT = function (comport) {
    this.comport = comport;
    this.lastData = null;

    this.serialPort = null;

    this.motorA = new Motor(this, nxtlib.ports.MOTOR_A);
    this.motorB = new Motor(this, nxtlib.ports.MOTOR_B);
};

util.inherits(NXT, EventEmitter);

NXT.prototype.setupSerialPort = function () {
    var serialPort = new SerialPort(this.comport, {}, false);

    serialPort.NXT = this;

    serialPort.on('error', handleErrorEvent);
    serialPort.on('data', handleDataEvent);
    serialPort.on('close', handleCloseEvent);
    serialPort.on('open', handleOpenEvent);
    serialPort.on('end', handleEndEvent);

    return serialPort;
}

NXT.prototype.keepAlive = function () {
    var $this = this;

    if (this.serialPort != null) {

        this.lastData = null;
        nxtlib.keepAlive(this.serialPort);

        this.keepAliveTimer = setTimeout(function () {
            if ($this.serialPort != null) {
                if ($this.lastData == null) {
                    debug("connection lost");
                    $this.serialPort.close();
                    return;
                }
                $this.keepAlive();
            }
        }, 5000);
    }
}

NXT.prototype.connect = function (callback) {
    var $this = this;

    if (this.serialPort != null) {
        debug('unable to connect, NXT is already connected');
        return;
    }

    debug('openning %s...', this.comport);

    var serialPort = this.setupSerialPort();

    serialPort.open(function (err) {
        if (err) {
            debug("connection error: %s", err);
            $this.emit('error', err);
        }

        utils.doCallback(callback, err);

        if (!err)
            $this.keepAlive();
    });
};

NXT.prototype.disconnect = function (callback) {
    if (this.serialPort == null) {
        debug('unable to disconnect, NXT is not connected');
        return;
    }

    this.serialPort.close(function () {
        utils.doCallback(callback);
    });
};

NXT.prototype.playtone = function (frequency, duration, callback) {
    if (this.serialPort == null) {
        debug('unable to playtone, NXT is not connected');
        return;
    }

    nxtlib.playtone(this.serialPort, frequency, duration, function () {
        utils.doCallback(callback);
    });
};

NXT.prototype.startMotorA = function (callback) {
    this.motorA.start(callback);
};

NXT.prototype.stopMotorA = function (callback) {
    this.motorA.stop(callback);
};

NXT.prototype.startMotorB = function (callback) {
    this.motorB.start(callback);
};

NXT.prototype.stopMotorB = function (callback) {
    this.motorB.stop(callback);
};

NXT.prototype.allStop = function (callback) {
    if (this.serialPort == null) {
        debug('unable to allStop, NXT is not connected');
        return;
    }

    nxtlib.setOutputState(this.serialPort, {
        port: nxtlib.ports.MOTOR_ALL,
        power: 0x00,
        mode: nxtlib.modes.BRAKE,
        regulationMode: nxtlib.regulationModes.IDLE
    }, function () {
        utils.doCallback(callback);
    });
};

module.exports.NXT = NXT;