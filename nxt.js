/*

RESOURCES
https://github.com/voodootikigod/node-serialport
https://github.com/paulcuth/node-nxt
https://github.com/davsebamse/node-mindstorm-bt

*/


var debug = require('debug')('nxt'),
    SerialPort = require("serialport").SerialPort;


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

var port = 'COM3';
var serialPort = new SerialPort(port, {}, false);

var status_handle = function (data) {
    data = data.slice(2);
    console.log('data received: ' + data);

    if (data[2] > 0)
        console.log("Error!");
};

var execute = function(sp, command, callback) {
    //The bluetooth packet need a length (2-bytes) in front of the packet
    var real_command = new Buffer([command.length & 0xff, (command.length >> 8) & 0xff]);
    real_command = Buffer.concat([real_command, command]);

    debug('sending command...');
    sp.write(real_command, function () {
        debug('command sent');
        callback();
    });
}

var reset_motor_position = function (sp, port, relative, callback) {
    var command = new Buffer([0x00, 0x0a, port, (relative ? 0x01 : 0x00)]);
    execute(sp, command, callback);
};

var playtone = function(sp, freq, dur, callback) {
    var command = new Buffer([0x00, 0x03, freq & 0xff, (freq >> 8) & 0xff, dur & 0x00ff, (dur >> 8) & 0xff]);
    execute(sp, command, callback);
}

debug('openning %s...', port);
serialPort.open(function () {
    debug('open');

    serialPort.on('data', function (data) {
        debug('data received: ', data);
        serialPort.close();
    });

    playtone(serialPort, 440, 1000, function () {
        //serialPort.close();
    });
});