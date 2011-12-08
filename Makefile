all:
	@echo This doesn\'t actually do anything.

debug:
	jshint *.js --config jshint.debug

release:
	jshint *.js --config jshint.release
