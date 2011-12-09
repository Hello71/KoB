all:
	xdg-open src/main.html

debug:
	jshint *.js --config jshint.debug

release:
	jshint *.js --config jshint.release
