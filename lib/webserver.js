var http = require('http'),
    debug = require('debug')('web-server'),
    util = require('util'),
    utils = require('./utils'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs');

function WebServer(port, address) {
    this.port = port || 80;
    this.address = address || '0.0.0.0';

    this.server = http.createServer(this.handler);
    this.server.WebServer = this;
}

util.inherits(WebServer, EventEmitter);

WebServer.prototype.listen = function (callback) {
    var $this = this;
    this.server.listen(this.port, this.address, function () {
        debug('listening on %s:%d', $this.address, $this.port);
        $this.emit('connect');
        utils.doCallback(callback);
    });
}

WebServer.prototype.deafen = function (callback) {
    var $this = this;
    this.server.close(function () {
        debug('deafened');
        $this.emit('close');
        utils.doCallback(callback);
    });
}

WebServer.prototype.handler = function (req, res) {
    var $this = this.WebServer;

    debug('request received for resource: %s', req.url);

    function respondEmpty() {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();
    }

    function respondDefault() {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + "/webserver.html").pipe(res);
    }

    switch (req.url) {
        case '/forward': $this.emit('forward'); respondEmpty(); break;
        case '/reverse': $this.emit('reverse'); respondEmpty(); break;
        case '/stop': $this.emit('stop'); respondEmpty(); break;
        case '/beep': $this.emit('beep'); respondEmpty(); break;
        default: respondDefault(); break;
    }

    $this.emit('request', req, res);
}

module.exports = WebServer;