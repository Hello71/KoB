var config = {
    root: "../src"
};

var server = require("express").createServer(),
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
    },
    argv = process.argv;

server.get("/", function (request, response) {
    readFile("/main.html", readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/html"
        }, 200);
    }));
});

server.get("/js/:js", function (request, response) {
    readFile("/js/" + request.params.js, readFunction(response, function (data) {
        response.send(data);
    }));
});

server.get("/css/:css", function (request, response) {
    readFile("/css/" + request.params.css, readFunction(response, function (data) {
        response.send(data, {
            "Content-Type": "text/css"
        });
    }));
});

server.get("/images/*", function (request, response) {
    if (request.params[0].indexOf("..") > -1) {
        response.send(403);
    }
    readFile("/images/" + request.params[0], readFunction(response, function (data) {
        response.send(data);
    }));
});

server.listen(8000);
