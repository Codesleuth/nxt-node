function doCallback() {
    if (arguments.length > 0) {
        var callback = arguments[0];
        if (Object.prototype.toString.call(callback) === '[object Function]') {
            var args = [].slice.apply(arguments).splice(1);
            callback.call(args);
        }
    }
}

module.exports.doCallback = doCallback;