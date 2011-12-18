#!/usr/bin/env node

exports.start = function (config) {
    "use strict";

    var express = require("express"),
        app = express.createServer(),
        argv = require("optimist")
            .alias("port", "p")["default"]("port", config.port)
            .alias("root", "r")["default"]("root", config.root)
            .alias("site", "s")["default"]("site", config.site)
            .argv,
        fs = require("fs"),
        http = require("http"),
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

    try {
        process.chdir(argv.root);
    } catch (e) {
        console.log("CURRENT DIRECTORY: " + process.cwd());
        console.log("Could not change directory.\nMake sure that the config root is set correctly.");
        process.exit(1);
    }

    app.get("/", function (request, response) {
        fs.readFile("main.html", "utf-8", readFunction(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            }, 200);
        }));
    });

    app.get("/js/:js", function (request, response) {
        fs.readFile("js/" + request.params.js, "utf-8", readFunction(response, function (data) {
            response.send(data, {
                "Content-Type": "application/javascript"
            });
        }));
    });

    app.get("/css/:css", function (request, response) {
        fs.readFile("css/" + request.params.css, "utf-8", readFunction(response, function (data) {
            response.send(data, {
                "Content-Type": "text/css"
            });
        }));
    });

    app.get("/images/*", function (request, response) {
        var image = request.params[0];
        if (image.indexOf("..") > -1) {
            response.send(403);
        }
        fs.readFile("images/" + image, readFunction(response, function (data) {
            response.send(data);
        }));
    });

    app.get("/login", function (request, response) {
        fs.readFile("login.html", "utf-8", readFunction(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            });
        }));
    });

    app.post("/login", express.bodyParser(), function (request, response) {
        var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
        response.cookie("SESSIONID", cookie, {
            maxAge: 1000000,
            httpOnly: true,
            domain: argv.site,
            path: "/"
        });
        fs.readFile("loggedin.html", "utf-8", readFunction(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            });
        }));
    });

    app.get("/villageData", express.cookieParser(), function (request, response) {
        debugger;
        if (typeof request.query.villageID === "undefined" || !(request.query.villageID.search(/\d{1-6}/))) {
            var res = "Malformed village ID.";
            response.writeHead(400, {
                "Content-Length": res.length,
                "Content-Type": "text/plain"
            });
            response.end(res, "utf-8");
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
            path: "/flash_getVillage.cfm?villageID=" + encodeURIComponent(request.query.villageID),
            headers: {
                Host: "kob.itch.com",
                "User-Agent": "KoB/0.1",
                Accept: "text/plain",
                "Accept-Charset": "utf-8",
                Cookie: "JSESSIONID=" + request.cookies.sessionid,
                Connection: "close",
                "Cache-Control": "max-age=0"
            }
        }, function (res) {
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

    console.log("Listening on port " + argv.port);
};
