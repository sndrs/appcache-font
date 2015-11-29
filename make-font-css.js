#!/usr/bin/env node

'use strict';

const fs = require('fs');
const chalk = require('chalk');
const cssFile = cssHash => `fonts.${cssHash}.css`;
const mainfestFile = 'manifest.appcache';

const fontFaceTemplate = (family, weight, style, data) => `@font-face {
    font-family: "${family}";
    src: url("data:application/x-font-woff;base64,${data}");
    font-weight: ${weight};
    font-style: ${style};
}`;

const manifestTemplate = (cssHash) => `CACHE MANIFEST

CACHE:
/${cssFile(cssHash)}

NETWORK:
*`;

const sizeTemplate = (string) => `${chalk.blue(require('pretty-bytes')(require('gzip-size').sync(string)))} ${chalk.grey('(gzip)')}`

// generate the CSS file
const css = require('./typefaces.json').map(typeface => {
    const css = typeface.fonts.map(font => {
        const css = fontFaceTemplate(
            typeface.family,
            font.weight,
            font.style,
            fs.readFileSync(__dirname + '/fonts/' + font.file, 'base64', err => {
                if (err) {
                    console.log('errror reading font', err);
                }
            })
        );
        console.log(`${typeface.family} (${font.weight}, ${font.style}): ${sizeTemplate(css)}`);
        return css;
    }).join('\n');
    console.log(`${typeface.family} (${typeface.fonts.length} variants): ${sizeTemplate(css)}`);
    return css;
}).join('\n');

const cssHash = require('crypto').createHash('md5').update(css).digest('hex');

// save the CSS to disk
fs.writeFile(cssFile(cssHash), css, 'utf-8', err => {
    if (err) {
        console.log('error writing CSS', err);
    }
});

// generate the manifest
fs.writeFile(mainfestFile, manifestTemplate(cssHash), 'utf-8', err => {
    if (err) {
        console.log('error writing manifest', err);
    }
});

require("replace")({
    regex: '<style data-fonts-URI="/fonts.*\.css">',
    replacement: `<style data-fonts-URI="/fonts.${cssHash}.css">`,
    paths: ["./index-localstorage.html"]
  })

console.log(`Total: ${sizeTemplate(css)}
`)
