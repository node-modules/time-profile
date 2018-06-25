'use strict';

const hrt = require('../lib/hrtime');
const assert = require('assert');

describe('test/hrtime.test.js', () => {
  it('should calculate elapsed time when nanos is bigger on end', () => {
    const diff = hrt.elapsed([ 3, 100000000 ], [ 5, 300000000 ]);
    assert(diff[0] === 2);
    assert(diff[1] === 200000000);
  });

  it('should calculate elapsed time when nanos is bigger on start', () => {
    const diff = hrt.elapsed([ 3, 10 ], [ 5, 5 ]);
    assert(diff[0] === 1);
    assert(diff[1] === 999999995);
  });

  it('should calculate total nanoseconds from hrtime', () => {
    assert(hrt.nano([ 0, 12345 ]) === 12345);
    assert(hrt.nano([ 10, 1000 ]) === 10000001000);
  });

  it('should throw an exception when a parameter is not a valid hrtime', () => {
    assert.throws(() => hrt.elapsed([ 3, 500 ], 7), TypeError);
    assert.throws(() => hrt.elapsed([ 3, 500 ], [ 5, 300, 1000 ]), TypeError);
    assert.throws(() => hrt.nano(7), TypeError);
    assert.throws(() => hrt.nano([ 5, 300, 1000 ]), TypeError);
  });

  it('should pretty print hrtime values using the best time unit', () => {
    assert(hrt.prettyHrtime([ 0, 123 ], { precise: true }) === '123 ns');
    assert(hrt.prettyHrtime([ 0, 1234 ], { precise: true }) === '1.234 μs');
    assert(hrt.prettyHrtime([ 0, 123456789 ], { precise: true }) === '123.456789 ms');
    assert(hrt.prettyHrtime([ 1, 123456789 ], { precise: true }) === '1.123456789 s');
    assert(hrt.prettyHrtime([ 1, 123456789 ]) === '1.12 s');
    assert(hrt.prettyHrtime([ 120, 123456789 ]) === '2 min');
    assert(hrt.prettyHrtime([ 125, 123456789 ]) === '2.08 min');
    assert(
      hrt.prettyHrtime([ 125, 123456789 ], { verbose: true }) ===
        '2 minutes 5 seconds 123 milliseconds 456 microseconds 789 nanoseconds'
    );
    assert(
      hrt.prettyHrtime([ 61, 1000001 ], { verbose: true }) ===
        '1 minute 1 second 1 millisecond 1 nanosecond'
    );
    assert(hrt.prettyHrtime([ 9000, 0 ]) === '2.5 h');
    assert(hrt.prettyHrtime([ 86400, 0 ]) === '24 h');
    assert(hrt.prettyHrtime([ 432000, 0 ], { precise: true }) === '120 h');
  });
});
