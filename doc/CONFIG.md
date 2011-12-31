# CONFIG #

Create a file in the `server` directory called `config.json` with JSON (must be JSON, not just a JavaScript object):

    {
        root: "/home/user/kob/src",
        port: 8080,
        cache: true
    }
    
* root: The root to serve files from. (Will only serve paths required by the software - see `server/server.js` for more details.)
* port: Self-documenting. Make sure you don't set a port under 1024 on *nix systems unless you have root (sudo, su, etc.)
* cache: Whether to read files once per run of the server. Reduces disk usage by a lot, but does not re-read files if they've been edited since the server was started. Recommended for production, not for development. I'm too lazy to implement a proper server with Last-Modified and If-Modified-Since.
