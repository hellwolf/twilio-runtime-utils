build:
	npm install
	(cd runtime; npm install)

clean:
	rm -rf node_modules
	rm -rf runtime/node_modules

.PHONY: build clean
