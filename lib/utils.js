function doCallback() {
    if (arguments.length > 0) {
        var callback = arguments[0];
        if (Object.prototype.toString.call(callback) === '[object Function]') {
            var args = Array.prototype.slice.apply(arguments).splice(1);
            Function.prototype.apply.call(callback, this, args);
        }
    }
}

module.exports.doCallback = doCallback;