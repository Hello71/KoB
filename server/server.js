#!/usr/bin/env node
var config = {
    root: "../src"
};

var express = require("express"),
    app = express.createServer(),
    argv = require("optimist")
        .alias("verbose", "v")["default"]("verbose", true).boolean("verbose")
        .alias("port", "p")["default"]("port", 8000)
        .alias("reload", "r")["default"]("reload", true).boolean("reload")
        .argv,
    fs = require("fs"),
    http = require("http"),
    readFile = function () {
        var args = arguments;
        args[0] = config.root + arguments[0];
        fs.readFile.apply(this, args);
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

app.post("/login", express.bodyParser(), function (request, response) {
    var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
    response.cookie("SESSIONID", cookie);
    response.send("Logged in with SESSIONID of \"" + cookie + "\".");
});

app.get("/villageData", function (request, response) {
    if (typeof request.query.villageID === "undefined") {
        response.send(400);
        return;
    }
    if (typeof request.header("Cookie") === "undefined") {
        response.send(401);
        return;
    }
    var data = "";
    http.get({
        host: "kob.itch.com",
        port: 80,
        method: "GET",
        path: "/flash_getVillage.cfm?villageID=1444",
        headers: {
            Host: "kob.itch.com",
            "User-Agent": "KoB/0.1",
            Accept: "text/plain",
            "Accept-Charset": "utf-8",
            Cookie: /SESSIONID=[a-z0-9]{36}/.exec(request.header("Cookie"))[0],
            Connection: "close",
            "Cache-Control": "max-age=0"
        }
    }, function (res) {
        res.setEncoding("utf-8");
        res.on("data", function (chunk) {
            data += chunk;
        });
        res.on("end", function () {
            response.writeHead(res.statusCode, {
                "Content-Length": data.length,
                "Content-Type": "text/plain"
            });
            response.end(data, "utf-8");
        });
    }).on("error", function (error) {
        response.send(500);
    });
});
app.listen(argv.port);
