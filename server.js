#!/usr/bin/env node
// Joyent start file. Do not use.
require("./server/server.js").start({
    root: "src",
    port: 80,
    verbosity: 2,
    file: "/home/node/kob.log"
});
