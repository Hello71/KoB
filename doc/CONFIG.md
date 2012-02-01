# CONFIG #

Create a file in the `server` directory called `config.json` with JSON (must be JSON, not just a JavaScript object):

    {
        root: "/home/user/kob/src",
        port: 8080,
        cache: false,
        userAgent: "KoB/0.1",
        verbosity: 1
    }
    
* root (REQUIRED): The root to serve files from. Will only serve paths required by the software - see `server/server.js` for more details.
* port (Optional): Self-documenting. Make sure you don't set a port under 1024 on *nix systems unless you have root (sudo, su, etc.). Defaults to 8080.
* cache (Optional): Whether to read files once per run of the server. Reduces disk usage by a lot, but does not re-read files if they've been edited since the server was started. Recommended for production, not for development. I'm too lazy to implement a proper server with Last-Modified and If-Modified-Since. Defaults to false.
* userAgent (Optional): What User-Agent to send to the KoB server. Defaults to "KoB/" + version, where version is currently 0.1 (which will change in the future).
* verbosity: Verbosity. Options are 0 (quiet), 1 (normal), 2 (verbose). Defaults to 1.
