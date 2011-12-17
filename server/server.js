#!/usr/bin/env node
var config = {
    root: ""
};

try {
    process.chdir(config.root);
} catch (e) {
    console.log("Could not change directory.\nMake sure that the config root is set correctly.");
    process.exit(1);
}

var express = require("express"),
    app = express.createServer(),
    argv = require("optimist")
        .alias("verbose", "v")["default"]("verbose", true).boolean("verbose")
        .alias("port", "p")["default"]("port", 8000)
        .alias("reload", "r")["default"]("reload", true).boolean("reload")
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

app.get("/", function (request, response) {
    fs.readFile("main.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html; charset=UTF-8"
        }, 200);
    }));
});

app.get("/js/:js", function (request, response) {
    fs.readFile("js/" + request.params.js, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "application/javascript; charset=UTF-8"
        });
    }));
});

app.get("/css/:css", function (request, response) {
    fs.readFile("css/" + request.params.css, "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/css; charset=UTF-8"
        });
    }));
});

app.get("/images/*.png", function (request, response) {
    if (request.params[0].indexOf("..") > -1) {
        response.send(403);
    }
    fs.readFile("images/" + request.params[0] + ".png", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "image/png"
        });
    }));
});

app.get("/login", function (request, response) {
    fs.readFile("login.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html; charset=UTF-8"
        });
    }));
});

app.post("/login", express.bodyParser(), function (request, response) {
    var cookie = request.body.cookie.replace(/\n/g, "").replace(/;/g, "%3B");
    response.cookie("SESSIONID", cookie);
    fs.readFile("loggedin.html", "utf-8", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html; charset=UTF-8"
        });
    }));
});

app.get("/villageData", function (request, response) {
    if (typeof request.query.villageID === "undefined" || !(request.query.villageID.search(/\d{1-6}/))) {
        var res = "Malformed village ID.";
        response.writeHead(400, {
            "Content-Length": res.length,
            "Content-Type": "text/plain; charset=UTF-8"
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
            Cookie: "J" + /SESSIONID=([a-z0-9]{36})/.exec(request.header("Cookie"))[0],
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
                "Content-Type": "text/plain; charset=UTF-8"
            });
            response.end(data, "utf-8");
        });
    }).on("error", function (error) {
        response.send(500);
    });
});
app.listen(argv.port);

console.log("Listening on port " + argv.port);
