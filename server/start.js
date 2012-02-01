#!/usr/bin/env node
"use strict";
var fs = require("fs"),
    configFile = "config.json",
    config = {};

if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
}
require("./server.js").start(config);
