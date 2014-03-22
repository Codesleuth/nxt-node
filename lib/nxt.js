var nxtlib = require('./nxtlib'),
    utils = require('./utils'),
    SerialPort = require("serialport").SerialPort,
    debug = require('debug')('NXT');

var NXT = function (comport) {
    var $this = this;

    this.comport = comport;
    this.connected = false;
    this.serialPort = new SerialPort(comport, {}, false);
    this.serialPort.on('data', function (data) {
        $this.handleDataEvent(data);
    });
    this.serialPort.on('close', function () {
        $this.handleCloseEvent();
    });
}

NXT.prototype.handleDataEvent = function (data) {
    var responseData = data.slice(2);
    debug('data received (%d bytes): ', responseData.length, responseData);

    var dataHeader = data.slice(0, 2);
    debug('data header (%d bytes): ', dataHeader.length, dataHeader);

    if (responseData[2] > 0)
        debug("Error in response: %d", responseData[2]);
};

NXT.prototype.handleCloseEvent = function () {
    this.connected = false;
    debug('closed connection to %s', this.comport);
};

NXT.prototype.connect = function (callback) {
    var $this = this;

    debug('openning %s...', $this.comport);

    $this.serialPort.open(function () {
        debug('openned %s', $this.comport);
        $this.connected = true;
        utils.doCallback(callback);
    });
};

NXT.prototype.disconnect = function (callback) {
    if (!this.connected) {
        debug('NXT is not connected');
        return;
    }

    this.serialPort.close(function () {
        utils.doCallback(callback);
    });
};

NXT.prototype.playtone = function (frequency, duration, callback) {
    if (!this.connected) {
        debug('NXT is not connected');
        return;
    }

    nxtlib.playtone(this.serialPort, frequency, duration, function () {
        utils.doCallback(callback);
    });
};

module.exports.NXT = NXT;