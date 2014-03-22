var utils = require('./utils'),
    debug = require('debug')('nxt-lib'),
    SerialPort = require("serialport").SerialPort;


function executeCommand(serialPort, command, callback) {
    var commandPrefix = new Buffer([command.length & 0xff, (command.length >> 8) & 0xff]);
    var fullCommand = Buffer.concat([commandPrefix, command]);

    debug('sending command (%d bytes)...', fullCommand.length);
    serialPort.write(fullCommand, function () {
        debug('command sent');
        callback();
    });
};

function playtone(serialPort, freq, dur, callback) {
    var command = new Buffer([0x00, 0x03, freq & 0xff, (freq >> 8) & 0xff, dur & 0x00ff, (dur >> 8) & 0xff]);
    executeCommand(serialPort, command, callback);
};

var setOutputState = function (serialPort, port, relative, callback) {
    var command = new Buffer([0x00, 0x0a, port, (relative ? 0x01 : 0x00)]);
    executeCommand(serialPort, command, callback);
};

module.exports ={
    setOutputState: setOutputState,
    playtone: playtone
};





var ports = {
    MOTOR_A: 0x00,
    MOTOR_B: 0x01,
    MOTOR_C: 0x02,
    MOTOR_ALL: 0xff
}

var modes = {
    MOTORON: 0x01,
    BRAKE: 0x02,
    REGULATED: 0x04
}