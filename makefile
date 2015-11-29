default:
	@./make-font-css.js

dev:
	@./node_modules/.bin/browser-sync start --server --files="*.css,*.html,*.js" --directory