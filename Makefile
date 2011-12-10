all:
	xdg-open src/main.html

debug:
	jshint src/js/* --config jshint/debug

release:
	jshint src/js/* --config jshint/release
