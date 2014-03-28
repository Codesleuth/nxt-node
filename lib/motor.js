var nxtlib = require('./nxtlib'),
	utils = require('./utils');

var Motor = function (NXT, motorByte) {
	this.NXT = NXT;
    this.motorByte = motorByte;
}

Motor.prototype.start = function (callback) {
    if (this.NXT.serialPort == null) {
        debug('unable to start motor, NXT is not connected');
        return;
    }

    nxtlib.setOutputState(this.NXT.serialPort, {
        port: this.motorByte,
        runState: nxtlib.runStates.RUNNING,
        power: 0x9C,
        mode: nxtlib.modes.MOTORON
    }, function () {
        utils.doCallback(callback);
    });
};

Motor.prototype.stop = function (callback) {
    if (this.NXT.serialPort == null) {
        debug('unable to start motor, NXT is not connected');
        return;
    }

    nxtlib.setOutputState(this.NXT.serialPort, {
        port: this.motorByte,
        power: 0x00,
        mode: nxtlib.modes.MOTOROFF,
        regulationMode: nxtlib.regulationModes.IDLE
    }, function () {
        utils.doCallback(callback);
    });
};

module.exports.Motor = Motor;