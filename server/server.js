#!/usr/bin/env node

this.start = function (config) {
    "use strict";

    var version = "0.1";
    var express = require("express"),
        path = require("path"),
        fs = require("fs"),
        http = require("http"),
        parser = require("./parser.js"),
        argv = require("optimist")
            .options("port", {
                alias: "p",
                "default": config.port || 8080
            }).options("root", {
                alias: "r",
                "default": config.root || path.dirname(process.argv[1]) + "../src"
            }).options("user-agent", {
                alias: "u",
                "default": config.userAgent || "KoB/" + version
            }).options("cache", {
                alias: "c",
                "default": config.cache || false
            }).options("verbosity", {
                alias: "v",
                "default": config.verbosity || 1
            }).options("host", {
                alias: "h",
                "default": config.host || null
            }).options("file", {
                alias: "f",
                "default": config.file || "STDOUT"
            }).argv,
        app = express.createServer(),
        extend = function (target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var j in source) {
                    if (source.hasOwnProperty(j)) {
                        target[j] = source[j];
                    }
                }
            }
            return target;
        },
        prepareHeaders = function (request, customHeaders) {
            var headers = {
                Host: "kob.itch.com",
                "User-Agent": argv["user-agent"],
                "Cache-Control": "max-age=0",
                Cookie: "JSESSIONID=" + request.cookies.sessionid
            },
                clientIP = request.connection.remoteAddress;
            if (typeof request.headers["X-Forwarded-For"] === "undefined") {
                headers["X-Forwarded-For"] = clientIP;
            } else {
                headers["X-Forwarded-For"] = request.headers["X-Forwarded-For"] + ", " + clientIP;
            }
            return extend(headers, customHeaders);
        },
        httpResponse = function (data, response) {
            if (data.indexOf("<TITLE>Earn your") > -1) {
                response.send(418);
                return false;
            } else {
                return true;
            }
        };

    try {
        process.chdir(argv.root);
    } catch (e) {
        console.log("Could not change directory.\nMake sure that the config root is set correctly.");
        process.exit(1);
    }
    if (argv.verbosity > 1) {
        var stream,
            file = argv.file;
        if (file === "STDOUT") {
            stream = process.stdout;
        } else if (file === "STDERR") {
            stream = process.stderr;
        } else {
            stream = fs.createWriteStream(file, {
                flags: "a"
            });
        }
        app.use(express.logger({
            format: "default",
            stream: stream
        }));
    }

    app.get("/", function (request, response) {
        response.sendfile("main.html");
    });

    app.get("/js/*", function (request, response) {
        var js = request.params[0];
        if (js.indexOf("..") > -1 || js.substr(-3) !== ".js") {
            response.send(403);
            return;
        }
        response.sendfile("js/" + js);
    });

    app.get("/css/*", function (request, response) {
        var css = request.params[0];
        if (css.indexOf("..") > -1 || css.substr(-4) !== ".css") {
            response.send(403);
            return;
        }
        response.sendfile("css/" + css);
    });

    app.get("/flash/*", function (request, response) {
        var flash = request.params[0];
        if (flash.indexOf("..") > -1 || flash.substr(-4) !== ".swf") {
            response.send(403);
            return;
        }
        response.sendfile("flash/" + flash);
    });

    app.get("/images/*", function (request, response) {
        var image = request.params[0],
            ext = image.substr(-4);
        if (image.indexOf("..") > -1 || (ext !== ".jpg" && ext !== ".png" && ext !== ".gif" && ext !== "tiff" && ext !== ".tif")) {
            response.send(403);
            return;
        }
        response.sendfile("images/" + image);
    });

    app.get("/login", function (request, response) {
        response.sendfile("login.html");
    });
    app.post("/login", express.bodyParser(), function (request, response) {
        var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
        response.cookie("SESSIONID", cookie, {
            httpOnly: true,
            path: "/"
        });
        response.send(303, {
            "Location": "/loggedin"
        });
    });
    app.get("/loggedin", function (request, response) {
        response.sendfile("loggedin.html");
    });

    app.get("/logout", function (request, response) {
        response.sendfile("logout.html");
    });
    app.post("/logout", function (request, response) {
        response.send(303, {
            "Set-Cookie": "SESSIONID=LOGGED OUT; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "Location": "/loggedout"
        });
    });
    app.get("/loggedout", function (request, response) {
        response.sendfile("loggedout.html");
    });

    app.get("/villageData", express.cookieParser(), function (request, response) {
        if (typeof request.query.villageID === "undefined" || request.query.villageID.search(/\d{1,5}/) === -1) {
            var res = "Malformed village ID.";
            response.writeHead(400, {
                "Content-Length": res.length,
                "Content-Type": "text/plain"
            });
            response.end(res, "utf-8");
            return;
        }
        if (typeof request.cookies.sessionid === "undefined") {
            response.send(401);
            return;
        }
        http.get({
            host: "kob.itch.com",
            path: "/flash_getVillage.cfm?villageID=" + encodeURIComponent(request.query.villageID),
            headers: prepareHeaders(request, {})
        }, function (res) {
            var data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                response.send(parser.parseVillage(data));
            });
        }).on("error", function (error) {
            response.send(500);
        });
    });

    app.get("/villages", express.cookieParser(), function (request, response) {
        if (typeof request.cookies.sessionid === "undefined") {
            response.send(401);
            return;
        }
        var ended = false,
            req = http.get({
            host: "kob.itch.com",
            path: "/home.cfm",
            headers: prepareHeaders(request, {})
        }, function (res) {
            res.setEncoding("utf8");
            var data = "";
            res.on("data", function (chunk) {
                if (!httpResponse(chunk, response)) {
                    req.end();
                    ended = true;
                    return;
                }
                if (chunk.indexOf("<option") > -1) {
                    data += chunk;
                }
            });
            res.on("error", function (err) {
                console.log("error retrieving home.cfm");
                console.log(err);
            });
            res.on("end", function () {
                if (ended) return;
                response.send(parser.parseVillages(data, response)); // Express automatically JSON.stringifys it
            });
        });
    });
    app.get("/units", function (request, response) {
        response.sendfile("json/units.json");
    });

    app.post("/trainUnits", express.cookieParser(), express.bodyParser(), function (request, response) {
        http.get({
            host: "kob.itch.com",
            path: "/flash_trainTroops.cfm?unitID=" + 1111121 + "&count=" + 99999 + "&villageID=" + 871,
            headers: prepareHeaders(request, {})
        }, function (res) {
            var data = "";
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                response.send(parser.parseTrainUnits(data));
            });
        });
    });

    app.get(/^\/mapDetail\.cfm|\/build\.cfm/, function (request, response) {
        response.redirect("http://kob.itch.com" + request.url);
    });
    if (argv.host) {
        app.listen(argv.port, argv.host);
    } else {
        app.listen(argv.port);
    }
};
