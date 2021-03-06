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
            }).options("max-age", {
                alias: "c",
                "default": config.maxAge || 600
            }).options("verbosity", {
                alias: "v",
                "default": config.verbosity || 1
            }).options("file", {
                alias: "f",
                "default": config.file || "STDOUT"
            }).options("format", {
                alias: "o",
                "default": config.format || "default"
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
        },
        getFile = function (path, file) {
            app.get(path, function (request, response) {
                response.sendfile(file);
            });
        },
        getFileName = function (name) {
            getFile("/" + name, name + ".html");
        },
        staticResource = function (base, allowedExts) {
            app.get("/" + base + "/*", function (request, response) {
                var file = request.params[0];
                if (file.indexOf("..") > -1) {
                    response.send(403);
                } else {
                    var ext = file.substr(-3);
                    for (var i = 0; i < allowedExts.length; i++) {
                        if (allowedExts[i] === ext) {
                            response.sendfile(base + "/" + file);
                            return;
                        }
                    }
                    response.send(404);
                }
            });
        };

    try {
        process.chdir(argv.root);
    } catch (e) {
        console.log("Could not change directory.\nMake sure that the config root is set correctly.");
        process.exit(1);
    }
    if (argv.verbosity > 2) {
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
            format: argv.format,
            stream: stream
        }));
    }
    
    getFile("/", "main.html");
    staticResource("js", [".js"]);
    staticResource("css", ["css"]);
    staticResource("flash", ["swf"]);
    staticResource("images", ["jpg", "png", "gif"]);
    getFile("/units", "json/units.json");


    getFileName("login");
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
    getFileName("loggedin");

    getFileName("loggedout");
    app.post("/logout", function (request, response) {
        response.send(303, {
            "Set-Cookie": "SESSIONID=LOGGED OUT; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "Location": "/loggedout"
        });
    });
    app.get("/loggedout", function (request, response) {
        response.sendfile("loggedout.html", {maxAge: argv.maxAge});
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

    app.post("/trainUnits", express.cookieParser(), express.bodyParser(), function (request, response) {
        http.get({
            host: "kob.itch.com",
            path: "/flash_trainTroops.cfm?unitID=" + request.body.type + "&count=" + request.body.amount + "&villageID=" + request.body.village,
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
