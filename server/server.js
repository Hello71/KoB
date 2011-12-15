#!/usr/bin/env node
var config = {
    root: "../src"
};

var express = require("express"),
    app = express.createServer(),
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

app.use(express.bodyParser());
app.get("/", function (request, response) {
    readFile("/main.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html"
        }, 200);
    }));
});

app.get("/js/:js", function (request, response) {
    readFile("/js/" + request.params.js, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "application/javascript"
        });
    }));
});

app.get("/css/:css", function (request, response) {
    readFile("/css/" + request.params.css, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/css"
        });
    }));
});

app.get("/images/*.png", function (request, response) {
    if (request.params[0].indexOf("..") > -1) {
        response.send(403);
    }
    readFile("/images/" + request.params[0] + ".png", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "image/png"
        });
    }));
});

app.get("/login", function (request, response) {
    readFile("/login.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html"
        });
    }));
});

app.post("/login", function (request, response) {
    var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
    response.cookie("SESSIONID", cookie);
    response.cookie("JSESSIONID", cookie);
    response.send("Logged in with SESSIONID of \"" + cookie + "\".");
});
app.listen(argv.port);
