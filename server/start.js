#!/usr/bin/env node
"use strict";
var fs = require("fs"),
    configFile = /.*\//.exec(process.argv[1])[0] + "config.json",
    config = {};

if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
}
require("./server.js").start(config);
