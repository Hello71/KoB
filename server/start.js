#!/usr/bin/env node
"use strict";
var fs = require("fs"),
    config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

require("./server.js").start(config);
