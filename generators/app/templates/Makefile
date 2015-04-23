clean:
	rm -rf node_modules/*

install:
	npm install

install-prod:
	make clean && npm install --production

update:
	make clean && rm -rf npm-shrinkwrap.json && npm install . && npm shrinkwrap

test:
	@NODE_ENV=test ./node_modules/.bin/jshint --reporter test/jshint/reporter.js
	./node_modules/.bin/istanbul cover --dir ./test/reports --print detail ./node_modules/.bin/_mocha -- -R spec test/unit

test-html:
	@NODE_ENV=test ./node_modules/.bin/jshint --reporter test/jshint/reporter.js
	./node_modules/.bin/istanbul cover --dir ./test/reports --print detail ./node_modules/.bin/_mocha -- -R spec test/unit
	xdg-open "file://${CURDIR}/test/reports/lcov-report/index.html" &

.PHONY: test test-html