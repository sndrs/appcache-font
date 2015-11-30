default:
	@./lib/make-font-css.js

dev:
	@./node_modules/.bin/browser-sync start --server build --files="*.css,*.html,*.js" --directory