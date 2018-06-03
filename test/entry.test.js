'use strict';

const Entry = require('../lib/entry');
const assert = require('assert');
const sleep = require('mz-modules/sleep');

describe('test/entry.test.js', () => {
  // Increases code coverage to 100%
  it('should be printed when no params are provided', async () => {
    const entry = new Entry('test');
    await sleep(10);
    entry.markEnd();
    assert.doesNotThrow(() => console.log(entry.toString()));
  });
});
