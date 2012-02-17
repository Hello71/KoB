#!/usr/bin/env node
"use strict";
var fs = require("fs"),
    path = require("path"),
    configFile = path.dirname(process.argv[1]) + "/config.json",
    config = {};

if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
}
require("./server.js").start(config);
