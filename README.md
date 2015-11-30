# localStorage vs appcache test
This is a test to compare the Guardian's slightly baroque `localStorage` font-loading strategy with a simpler dependence on appcache.

It inlines some fonts as data URIs in a css file which is either added to the appcache manifest or manually cached in `localStorage`.

## Setup
`npm i`.

`make` to generate CSS + manifest etc in `/build`.

`make dev` to view the 2 options in browser.

### Conclusion

`localStorage` is a much better option.

- the iframe hack no longer appears to work (in modern chrome at least), meaning you have attach the manifest to any page for which you want to load fonts from the app cache. This means that page will be added too, which makes it useless for a live-updating site.
- even if that weren't true, the delay added to rendering by the injection from `localStorage` appears imperceptible. When combined with the fact that it forces fonts to be parsed before all other CSS, and so does not trigger a 2nd paint, it actually _feels_ more robust, even if first paint is slightly delayed.