// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var http = require('http');
var util = require('./util.js');
var print = console.log.bind(console);

var url = 'http://www.unicode.org/Public/UNIDATA/DerivedCoreProperties.txt';

util.printLicense();
util.printAutoGenerated(url);

var data = '';

http.get(url, function(res) {
  res.setEncoding('utf-8');
  res.on('data', function(chunk) {
    data += chunk;
  });
  res.on('end', processData);
});

var unicodeIdStart = [];
var unicodeIdContinue = [];

var idStartRanges = {};

function printArray(name, array) {
  print('export var ' + name + ' = [');
  for (var i = 0; i < array.length; i += 2) {
    print('  ' + array[i] + ', ' + array[i + 1] + ',');
  }
  print('];')
}

function processData() {
  data.split(/\n/).forEach(function(line) {
    var m;
    if ((m = line.match(/(.+)\.\.(.+)\s+;\s+ID_Start/))) {
      var c1 = parseInt(m[1], 16);
      var c2 = parseInt(m[2], 16);
      if (c2 < 128)
        return;
      unicodeIdStart.push(c1, c2);
      idStartRanges[c1 + '..' + c2] = true;
    } else if ((m = line.match(/(.+)\s+;\s+ID_Start/))) {
      var c1 = parseInt(m[1], 16);
      if (c1 < 128)
        return;
      unicodeIdStart.push(c1, c1);
      idStartRanges[c1 + '..' + c1] = true;
    }
  });

  data.split(/\n/).forEach(function(line) {
    var m;
    if ((m = line.match(/(.+)\.\.(.+)\s+;\s+ID_Continue/))) {
      var c1 = parseInt(m[1], 16);
      var c2 = parseInt(m[2], 16);
      if (c2 < 128)
        return;
      if (idStartRanges[c1 + '..' + c2])
        return;
      unicodeIdContinue.push(c1, c2);
    } else if ((m = line.match(/(.+)\s+;\s+ID_Continue/))) {
      var c1 = parseInt(m[1], 16);
      if (c1 < 128)
        return;
      if (idStartRanges[c1 + '..' + c1])
        return;
      unicodeIdContinue.push(c1, c1);
    }
  });

  printArray('idStartTable', unicodeIdStart);
  print('');
  printArray('idContinueTable', unicodeIdContinue);
}
