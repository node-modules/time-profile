'use strict';

const prettyHrtime = require('pretty-hrtime');

function nano(hrtime) {
  if (!Array.isArray(hrtime) || hrtime.length !== 2) {
    throw new TypeError('expected an array from process.hrtime()');
  }
  return hrtime[0] * 1e9 + hrtime[1];
}

function elapsed(start, end) {
  if (!(Array.isArray(start) && start.length === 2 && Array.isArray(end) && end.length === 2)) {
    throw new TypeError('expected an array from process.hrtime()');
  }
  return end[1] >= start[1]
    ? [ end[0] - start[0], end[1] - start[1] ]
    : [ end[0] - start[0] - 1, end[1] + start[1] ];
}

module.exports = { nano, elapsed, prettyHrtime };
