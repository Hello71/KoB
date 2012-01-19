#!/usr/bin/env node

this.start = function (config) {
    "use strict";

    var version = "0.1";
    var express = require("express"),
        app = express.createServer(),
        argv = require("optimist")
            .alias("port", "p")["default"]("port", config.port || 8080)
            .alias("root", "r")["default"]("root", config.root)
            .alias("user-agent", "u")["default"]("user-agent", config.userAgent || "KoB/" + version)
            .alias("cache", "c")["default"]("cache", config.cache || false)
            .argv,
        fs = require("fs"),
        http = require("http"),
        cache = {},
        readFile = function (path, encoding_) {
            if (!argv.cache) {
                return fs.readFile.apply(this, arguments);
            }

            var encoding = typeof(encoding_) === 'string' ? encoding_ : null;
            var callback = arguments[arguments.length - 1];
            if (typeof callback !== "function") {
                callback = function () {};
            }

            if (typeof cache[path] !== "undefined") {
                var cached = cache[path];
                if (cached.encoding === encoding) {
                    callback(null, cached.data);
                }
                // else fall through to re-read (assuming most people don't switch back and forth between encodings for the same file)
            }
            fs.readFile(path, encoding, function (err, data) {
                if (err) {
                    callback(err, data);
                } else {
                    cache[path] = {
                        encoding: encoding,
                        data: data
                    };
                    callback(err, data);
                }
            });
        },
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
        parse = require("./parse.js").parse;

    try {
        process.chdir(argv.root);
    } catch (e) {
        console.log("Could not change directory.\nMake sure that the config root is set correctly.");
        process.exit(1);
    }

    app.get("/", function (request, response) {
        readFile("main.html", "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/html"
            }, 200);
        }));
    });

    app.get("/js/:js", function (request, response) {
        readFile("js/" + request.params.js, "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "application/javascript"
            });
        }));
    });

    app.get("/css/:css", function (request, response) {
        readFile("css/" + request.params.css, "utf-8", readCallback(response, function (data) {
            response.send(data, {
                "Content-Type": "text/css"
            });
        }));
    });

    app.get("/images/*", function (request, response) {
        var image = request.params[0],
            ext = image.substring(image.length - 4);
        if (image.indexOf("..") > -1 || (ext !== ".jpg" && ext !== ".png" && ext !== ".gif" && ext !== "tiff" && ext !== ".tif")) {
            response.send(403);
        }
        readFile("images/" + image, readCallback(response, function (data) {
            response.send(data);
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
            expires: new Date(3000, 0, 1),
            httpOnly: true,
            path: "/"
        });
        readFile("loggedin.html", "utf-8", readCallback(response, function (data) {
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
        http.get({
            host: "kob.itch.com",
            path: "/flash_getVillage.cfm?villageID=" + encodeURIComponent(request.query.villageID),
            headers: {
                Host: "kob.itch.com",
                "User-Agent": argv["user-agent"],
                Cookie: "JSESSIONID=" + request.cookies.sessionid,
                "Cache-Control": "max-age=0"
            }
        }, function (res) {
            res.pipe(response);
        }).on("error", function (error) {
            response.send(500);
        });
    });

    app.get("/villages", express.cookieParser(), function (request, response) {
        if (typeof request.cookies.sessionid === "undefined") {
            response.send(401);
            return;
        }
        http.get({
            host: "kob.itch.com",
            path: "/home.cfm",
            headers: {
                Host: "kob.itch.com",
                "User-Agent": argv["user-agent"],
                Cookie: "JSESSIONID=" + request.cookies.sessionid,
                "Cache-Control": "max-age=0"
            }
        }, function (res) {
            res.setEncoding("utf8");
            var data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                if (data.indexOf("<option") === -1) {
                    var err = "no villages";
                    response.writeHead(500, {
                        "Content-Length": err.length,
                        "Content-Type": "text/plain"
                    });
                    response.end(err);
                    return;
                }
                var villages = {},
                    re = /<option value="(\d{1,5})"( selected="selected")?>([A-Za-z0-9 ]*)/g,
                    match;
                while ((match = re.exec(data)) !== null) {
                    villages[match[1]] = match[3];
                }
                response.send(villages); // Express automatically JSON.stringifys it
            });
        });
    });
                    
    app.listen(argv.port);

    console.log("Listening on port " + argv.port);
};
