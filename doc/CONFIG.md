# CONFIG #

Create a file in the `server` directory called `config.json` with JSON (must be JSON, not just a JavaScript object):

    {
        "root": "/home/user/kob/src",
        "port": 8080,
        "userAgent": "KoB/0.1",
        "verbosity": 2,
        "maxAge": 600
    }
    
* root (Optional): The root to serve files from. Will only serve paths required by the software - see `server/server.js` for more details. Defaults to `path.dirname(process.argv[1]) + "../src"`. On command line, also `-r`.
* port (Optional): Self-documenting. Make sure you don't set a port under 1024 on *nix systems unless you have root (sudo, su, etc.). Defaults to 8080. On command line, also `-p`.
* userAgent (Optional): What User-Agent to send to the KoB server. Defaults to `"KoB/" + version`, where version is currently 0.1 (which will change in the future). On command line, also `-u`.
* verbosity (Optional): Verbosity. Options are 1 (quiet), 2 (normal), 3 (verbose). Defaults to 2. On command line, also `-v`.
* maxAge (Optional): max-age on static responses in seconds. Defaults to 600. On command line, also `-m`.
* file (Optional): File to log to if verbosity=3. Can also be `STDOUT` or `STDERR`. Defaults to `STDOUT`. On command line, also `-f`.
* format (Optional): Logging format of [express.logger()](http://www.senchalabs.org/connect/middleware-logger.html). Defaults to `default`. On command line, also `-o`.

Note: These options can also be specified on the command line with camelCase replaced with hy-phens. Equals signs, spaces, short and long options can all be interchanged.

    ./start.js --root ../src --port 80 --cache=true --user-agent=KoB/1.0 --verbosity=2 --max-age=600
