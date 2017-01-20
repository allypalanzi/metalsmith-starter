#!/usr/bin/env node

/*
Metalsmith build file
Build site with `node ./build.js` or `npm start`
Build production site with `npm run production`
*/

'use strict';

var
// defaults
  consoleLog = false, // set true for metalsmith file and meta content logging
  devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production'),
  pkg = require('./package.json'),

  // main directories
  dir = {
    base: __dirname + '/',
    lib: __dirname + '/lib/',
    source: './src/',
    dest: './build/'
  },

  // modules
  metalsmith = require('metalsmith'),
  layouts = require('metalsmith-layouts'),
  assets = require('metalsmith-assets'),
  sass = require('metalsmith-sass'),
  autoprefixer = require('metalsmith-autoprefixer'),
  uglify = devBuild ? null : require('metalsmith-uglify'),
  htmlmin = devBuild ? null : require('metalsmith-html-minifier'),
  browsersync = devBuild ? require('metalsmith-browser-sync') : null,

  templateConfig = {
    engine: 'handlebars',
    directory: dir.source + 'template/',
    partials: dir.source + 'partials/',
    default: 'page.html'
  };

console.log((devBuild ? 'Development' : 'Production'), 'build, version', pkg.version);

var ms = metalsmith(dir.base)
  .clean(!devBuild) // clean folder before a production build
  .source(dir.source + 'html/') // source folder (src/html/)
  .destination(dir.dest) // build folder (build/)
  .use(layouts(templateConfig)); // layout templating

// minify production html & js
if (htmlmin) ms.use(htmlmin());
if (uglify) ms.use(uglify({
  nameTemplate: '[name].[ext]'
}));

if (browsersync) ms.use(browsersync({ // start test server
  server: dir.dest,
  files: [dir.source + '**/*']
}));

ms
  .use(assets({ // copy assets: CSS, images etc.
    source: dir.source + 'assets/',
    destination: './'
  }))
  .use(sass({
    outputDir: 'css/'   // This changes the output dir to "build/css/" instead of "build/scss/"
  }))
  .use(autoprefixer())
  .build(function(err) { // build
    if (err) throw err;
  });
