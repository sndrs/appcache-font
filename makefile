default:
	@rm -f fonts.css gu.appcache
	@./make-font-css.js

dev:
	browser-sync start --server --files="*.css,*.html,*.js"