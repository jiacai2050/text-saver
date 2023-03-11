
build:
	zip -r ~/text-saver.zip *.js libs/* *.json *.html imgs/logo.png

lint:
	find . -type f -maxdepth 1 | grep -v org | grep -v Makefile | xargs npx prettier@2.7.1 --write
	npx prettier@2.7.1 --write .github/workflows/lint.yml
