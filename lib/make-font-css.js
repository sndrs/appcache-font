#!/usr/bin/env node

'use strict';

const fs = require('fs');
const chalk = require('chalk');
const cssFile = cssHash => `fonts.${cssHash}.css`;
const mainfestFile = 'manifest.appcache';

const srcDir = __dirname + '/../src/';
const buildDir = __dirname + '/../build/';

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

const sizeTemplate = (string) => `${chalk.blue(require('pretty-bytes')(require('gzip-size').sync(string)))} ${chalk.grey('(gzip)')}`;

// generate the CSS
const css = require('../fonts-config.json').map(typeface => {
    const css = typeface.fonts.map(font => {
        const css = fontFaceTemplate(
            typeface.family,
            font.weight,
            font.style,
            fs.readFileSync(srcDir + 'fonts/' + font.file, 'base64', err => {
                if (err) {
                    console.log('errror reading font', err);
                }
            })
        );
        console.log(`${typeface.family} (${font.weight}, ${font.style}): ${sizeTemplate(css)}`);
        return css;
    }).join('\n');
    console.log(`${chalk.green(typeface.family)} (${typeface.fonts.length} variants): ${sizeTemplate(css)}\n`);
    return css;
}).join('\n');

console.log(`Total: ${sizeTemplate(css)}
`);

const cssHash = require('crypto').createHash('md5').update(css).digest('hex');

// generate build
require('del')([buildDir]).then(() => {
    require("mkdirp")(buildDir, () => {
        // save the CSS to disk
        fs.writeFile(buildDir + cssFile(cssHash), css, 'utf-8', err => {
            if (err) {
                console.log('error writing CSS', err);
            }
        });

        // generate the manifest
        fs.writeFile(buildDir + mainfestFile, manifestTemplate(cssHash), 'utf-8', err => {
            if (err) {
                console.log('error writing manifest', err);
            }
        });

        ['index-appcache.html', 'index-localstorage.html'].forEach(file => {
            fs.readFile(srcDir + file, 'utf8', function(err, data) {
                if (err) {
                    console.log('error reading output HTML', err);
                    return
                }

                var HTML = data.replace(/fonts\.css/g, `fonts.${cssHash}.css`);
                fs.writeFile(buildDir + file, HTML, 'utf8', function(err) {
                    if (err) {
                        console.log('error writing output HTML', err);
                        return;
                    }
                });
            });
        })
    })
});