#!/usr/bin/env node
var config = {
    root: "../src"
};

var server = require("express").createServer(),
    argv = require("optimist")
        .alias("verbose", "v").default("verbose", true).boolean("verbose")
        .alias("port", "p").default("port", 8000)
        .alias("reload", "r").default("reload", true).boolean("reload")
        .argv;
    fs = require("fs"),
    readFile = function () {
        arguments[0] = config.root + arguments[0];
        fs.readFile.apply(this, arguments);
    },
    readFunction = function (response, passTo) {
        return function (err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    response.send(404);
                } else {
                    response.send(500);
                }
            } else {
                passTo(data);
            }
        };
    };

server.get("/", function (request, response) {
    readFile("/main.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html"
        }, 200);
    }));
});

server.get("/js/:js", function (request, response) {
    readFile("/js/" + request.params.js, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "application/javascript"
        });
    }));
});

server.get("/css/:css", function (request, response) {
    readFile("/css/" + request.params.css, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/css"
        });
    }));
});

server.get("/images/*.png", function (request, response) {
    if (request.params[0].indexOf("..") > -1) {
        response.send(403);
    }
    readFile("/images/" + request.params[0] + ".png", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "image/png"
        });
    }));
});

server.listen(argv.port);
