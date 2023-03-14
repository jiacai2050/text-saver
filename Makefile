CHROME_DST = ~/text-saver-chrome.zip
FIREFOX_DST = ~/text-saver-firefox.zip

build: buildc buildf

buildc:
	rm -f $(CHROME_DST)
	zip -r $(CHROME_DST) option.html *.js libs/* manifest.json imgs/logo.png

buildf:
	rm -f $(FIREFOX_DST)
	node build.mjs
	zip -r $(FIREFOX_DST) option.html *.js libs/* manifest.json imgs/logo.png
	git checkout -- manifest.json

lint:
	npx prettier@2.7.1 --write .
