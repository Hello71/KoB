#!/usr/bin/env node

this.start = function (config) {
    "use strict";

    var version = "0.1";
    var express = require("express"),
        app = express.createServer(),
        argv = require("optimist")
            .options("port", {
                alias: "p",
                default: config.port || 8080
            }).options("root", {
                alias: "r",
                "default": config.root
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
            }).argv,
        util = require("./util.js").init(argv),
        log = util.log,
        http = require("http"),
        readCallback = function (response, passTo) {
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
        },
        readFile = util.readFile,
        parser = require("./parser.js"),
        unitData = "",
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
        app.use(express.logger());
    }

    app.get("/", function (request, response) {
        readFile("main.html", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            }, 200);
        }));
    });

    app.get("/js/*", function (request, response) {
        var js = request.params[0];
        if (js.indexOf("..") > -1 || js.substr(-3) !== ".js") {
            response.send(403);
            return;
        }
        readFile("js/" + js, "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "application/javascript"
            });
        }));
    });

    app.get("/css/*", function (request, response) {
        var css = request.params[0];
        if (css.indexOf("..") > -1 || css.substr(-4) !== ".css") {
            response.send(403);
            return;
        }
        readFile("css/" + css, "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/css"
            });
        }));
    });

    app.get("/flash/*", function (request, response) {
        var flash = request.params[0];
        if (flash.indexOf("..") > -1 || flash.substr(-4) !== ".swf") {
            response.send(403);
            return;
        }
        readFile("flash/" + flash, readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "application/x-shockwave-flash"
            });
        }));
    });

    app.get("/images/*", function (request, response) {
        var image = request.params[0],
            ext = image.substr(-4);
        if (image.indexOf("..") > -1 || (ext !== ".jpg" && ext !== ".png" && ext !== ".gif" && ext !== "tiff" && ext !== ".tif")) {
            response.send(403);
            return;
        }
        var imgExts = {
            ".jpg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            "tiff": "image/tiff",
            ".tif": "image/tiff"
        };
        readFile("images/" + image, readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": imgExts[ext]
            });
        }));
    });

    app.get("/login", function (request, response) {
        readFile("login.html", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            });
        }));
    });
    app.post("/login", express.bodyParser(), function (request, response) {
        var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
        response.cookie("SESSIONID", cookie, {
            httpOnly: true,
            path: "/"
        });
        response.send(303, {
            "Location: /loggedin"
        });
    });
    app.get("/loggedin", function (request, response) {
        readFile("loggedin.html", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            });
        }));
    });

    app.get("/logout", function (request, response) {
        response.send(405);
    });
    app.post("/logout", function (request, response) {
        response.send(303, {
            "Set-Cookie": "SESSIONID=LOGGED OUT; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "Location": "/loggedout"
        });
    });
    app.get("/loggedout", function (request, response) {
        readFile("loggedout.html", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            });
        }));
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
        var req = http.get({
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
        readFile("json/units.json", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "application/json"
            });
        }));
    });

    app.post("/trainUnits", express.cookieParser(), express.bodyParser(), function (request, response) {
        var ended = false,
            req = http.get({
            host: "kob.itch.com",
            path: "/flash_trainTroops.cfm?unitID=" + encodeURIComponent(request.body.type) + "&count=" + encodeURIComponent(request.body.amount) + "&villageID=" + encodeURIComponent(request.body.village),
            headers: prepareHeaders(request, {})
        }, function (res) {
            var data = "";
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                if (!httpResponse(chunk, response)) {
                    req.end();
                    ended = true;
                    return;
                }
                data += chunk;
            });
            res.on("end", function () {
                if (ended) return;
                response.send(data, {
                    "Content-Type": "text/plain"
                });
            });
        });
    });
    if (argv.host) {
        app.listen(argv.port, argv.host);
    } else {
        app.listen(argv.port);
    }
};
