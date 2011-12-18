#!/usr/bin/env node
// Joyent start file. Do not use.
require("server/server.js").start({
    root: "src",
    port: 80,
    site: "hello71.no.de"
});
