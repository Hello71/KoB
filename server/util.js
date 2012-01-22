var fs = require("fs");

exports.init = function (argv) {
    "use strict";
    var cache = {};
    return {
        readFile: function (path, encoding_) {
            if (!argv.cache) {
                return fs.readFile.apply(this, arguments);
            }

            var encoding = typeof(encoding_) === 'string' ? encoding_ : null;
            var callback = arguments[arguments.length - 1];
            if (typeof callback !== "function") {
                callback = function () {};
            }

            if (typeof cache[path] !== "undefined") {
                var cached = cache[path];
                if (cached.callback === callback && cached.encoding === encoding) {
                    callback(cached.data);
                    return cached.data;
                }
                // else fall through to re-read (assuming most people don't switch back and forth between encoding/callbacks for the same file)
            }
            fs.readFile(path, encoding, function (err, data) {
                if (err) {
                    callback(err, data);
                } else {
                    cache[path] = {
                        callback: callback,
                        encoding: encoding,
                        err: err,
                        data: data
                    };
                    callback(err, data);
                }
            });
        }
    };
};
