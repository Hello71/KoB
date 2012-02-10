var fs = require("fs"),
    assert = require("assert");

exports.init = function (argv) {
    "use strict";
    var cache = {};
    return {
        log: function (msg, level) {
            assert(typeof msg !== "undefined");
            if (typeof level !== "undefined") {
                assert(level > -1);
            }
            if (argv.verbosity >= level) {
                console.log(msg);
            }
        }
    };
};
