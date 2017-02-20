#!/usr/bin/env node

'use strict';

var fs = require('fs');

if (fs.existsSync('styles')) {
  require('child_process').execSync('rm -r styles', {stdio: 'inherit'});
}

var styles = fs.readdirSync('styles_modules');
for (var i = 0; i < styles.length; i++) {
  var style = styles[i];
  console.log('Downloading', style);
  require('child_process').execSync(
    ('cd styles_modules/{s};' +
     'wget -q -i url -O tmp.zip;' +
     'unzip -o tmp.zip;' +
     'rm tmp.zip;cd ../..')
      .replace(/\{s\}/g, style), {
    stdio: 'inherit'
  });

  var stylePath = 'styles_modules/' + style + '/style-local.json';
  if (fs.existsSync(stylePath)) {
    console.log('Preparing', style);
    require('child_process').execSync(
      ('mkdir -p styles/{s} && ' +
       'cp styles_modules/{s}/sprite* styles/{s}/ 2>/dev/null || :')
        .replace(/\{s\}/g, style), {
      stdio: 'inherit'
    });

    var styleJSON = JSON.parse(fs.readFileSync(stylePath, 'utf8'));

    // only keep the first font -- it should be "Open Sans"
    styleJSON.layers.forEach(function(layer) {
      if (layer.layout && layer.layout['text-font']) {
        layer.layout['text-font'] = layer.layout['text-font'].slice(0, 1);
      }
    });

    fs.writeFileSync(
      'styles/' + style + '/style.json',
      JSON.stringify(styleJSON, null, 2),
      'utf8'
    );
  }
}


/* PUBLISH */
console.log('Publishing to npm');
require('child_process').execSync('npm publish .', {
  stdio: 'inherit'
});
