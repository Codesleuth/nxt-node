var EventSource = require('eventsource'),
    debug = require('debug')('push-listener');

function PushListener(messageHandler, errorHandler) {
    this.listener = null;
    this.errorHandler = errorHandler || function (e) {
        debug('PushListener error: %j', e);
    };
    this.messageHandler = messageHandler || function (msg) {
        debug('PushListener received push %s: ', msg);
    };
}

PushListener.prototype.listen = function (url) {
    
    var $this = this;
    this.listener = new EventSource(url);

    this.listener.onerror = function (e) {
        $this.errorHandler(e);
    };

    this.listener.onmessage = function(message) {
        var json = JSON.parse(message.data);

        if (json && json.event == "connect")
            debug("PushListener connected with account ID: %s", json.accountId);
        else
            $this.messageHandler(json);
    };
}

PushListener.prototype.deafen = function () {
    debug("PushListener deafening...");
    this.listener.close();
    this.listener = null;
    debug("PushListener deafened");
}

module.exports.PushListener = PushListener;