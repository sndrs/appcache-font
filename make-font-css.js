#!/usr/bin/env node

'use strict';

const fs = require('fs');
const chalk = require('chalk');
const cssFile = 'fonts.css';
const mainfestFile = 'manifest.appcache';

const fontFaceTemplate = (family, weight, style, data) => `@font-face {
    font-family: "${family}";
    src: url(data:application/x-font-woff;base64,${data});
    font-weight: ${weight};
    font-style: "${style}";
}`;

const manifestTemplate = (cssHash) => `CACHE MANIFEST
# ${cssHash}

CACHE:
/${cssFile}

NETWORK:
*`;

const sizeTemplate = (string) => `${chalk.blue(require('pretty-bytes')(require('gzip-size').sync(string)))} ${chalk.grey('(gzip)')}`

// generate the CSS file
const css = require('./typefaces.json').map(typeface => {
    const css = typeface.fonts.map(font =>
        fontFaceTemplate(
            typeface.family,
            font.weight,
            font.style,
            fs.readFileSync(__dirname + '/fonts/' + font.file, 'base64', err => {
                if (err) {
                    console.log('errror reading font', err);
                }
            })
        )
    ).join('\n');
    console.log(`${typeface.family} (${typeface.fonts.length} variants): ${sizeTemplate(css)}`);
    return css;
}).join('\n');

// save the CSS to disk
fs.writeFile(cssFile, css, 'utf-8', err => {
    if (err) {
        console.log('error writing CSS', err);
    }
});

// generate the manifest
fs.writeFile(mainfestFile, manifestTemplate(require('crypto').createHash('md5').update(css).digest('hex')), 'utf-8', err => {
    if (err) {
        console.log('error writing manifest', err);
    }
});

console.log(`Total: ${sizeTemplate(css)}
`)
