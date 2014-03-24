var utils = require('./utils'),
    debug = require('debug')('nxt-lib'),
    SerialPort = require("serialport").SerialPort;

function executeCommand(serialPort, command, callback) {
    var commandPrefix = [command.length & 0xff, (command.length >> 8) & 0xff];
    var fullCommand = new Buffer(commandPrefix.concat(command));

    debug('sending command (%d bytes): ', command.length, command);
    serialPort.write(fullCommand, function (error) {
        if (error) {
            debug('write error: ', error);
            return;
        }

        debug('command sent');
        utils.doCallback(callback);
    });
};

function playtone(serialPort, freq, dur, callback) {
    var command = [
        replyFlag.NOT_REQUIRED
        ,commandFlag.PLAYTONE
        ,freq & 0xff, (freq >> 8) & 0xff
        ,dur & 0x00ff, (dur >> 8) & 0xff
    ];
    executeCommand(serialPort, command, callback);
};

var setOutputState = function (serialPort, options, callback) {
    var _options = {
        port: options && options.port || ports.MOTOR_ALL,
        power: options && options.power || 0x64,
        mode: options && options.mode || modes.MOTORON,
        regulationMode: options && options.regulationMode || regulationModes.MOTOR_SPEED,
        turnRatio: options && options.regulationMode || 0x00,
        runState: options && options.runState || runStates.RUNNING,
        tachoState: options && options.tachoState || [0x00, 0x00, 0x00, 0x00]
    };

    var command = [
        replyFlag.NOT_REQUIRED
        ,commandFlag.SETOUTPUTSTATE
        ,_options.port // Output port, range 0 to 3
        ,_options.power // Power set point, range -100 to 100 (0x9C to 0x64)
        ,_options.mode // Mode byte
        ,_options.regulationMode // Regulation modes UBYTE
        ,_options.turnRatio // Turn ratio SBYTE -100 to 100
        ,_options.runState // Run state UBYTE 
    ].concat(_options.tachoState);

    executeCommand(serialPort, command, callback);
};

function keepAlive(serialPort, callback) {
    var command = [replyFlag.REQUIRED, commandFlag.KEEPALIVE];
    executeCommand(serialPort, command, callback);
};

var commandFlag = {
    PLAYTONE: 0x03,
    SETOUTPUTSTATE: 0x04,
    KEEPALIVE: 0x0D
}

var replyFlag ={
    REQUIRED: 0x00,
    NOT_REQUIRED: 0x80
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

var regulationModes = {
    IDLE: 0x00,
    MOTOR_SPEED: 0x01,
    MOTOR_SYNC: 0x02
}

var runStates = {
    IDLE: 0x00,
    RAMPUP: 0x10,
    RUNNING: 0x20,
    RAMPDOWN: 0x40
}


module.exports ={
    setOutputState: setOutputState,
    playtone: playtone,
    keepAlive: keepAlive,
    ports: ports,
    modes: modes,
    regulationModes: regulationModes,
    runStates: runStates
};
