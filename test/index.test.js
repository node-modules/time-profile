'use strict';

const timeProfile = require('..');
const { elapsed } = require('../lib/hrtime');
const shallowEqualArrays = require('shallow-equal/arrays');
const assert = require('assert');
const utility = require('utility');
const sleep = require('mz-modules/sleep');

function workHard(num) {
  num = num * 1000000;
  while (num--) {
    Math.exp(10000);
  }
}

describe('test/index.test.js', () => {
  const profiler = timeProfile.getProfiler();

  beforeEach(() => {
    profiler.reset();
  });

  after(() => {
    profiler.destroy();
  });

  it('should trace', () => {
    profiler.start('a');
    const da = profiler.end('a');
    profiler.start('b');
    const db = profiler.end('b');

    assert.strictEqual(typeof da[0], 'number');
    assert.strictEqual(typeof da[1], 'number');
    assert.strictEqual(typeof db[0], 'number');
    assert.strictEqual(typeof db[1], 'number');

    const json = profiler.toJSON();
    assert(json.length === 2);

    assert(json[0].name === 'a');
    assert(shallowEqualArrays(elapsed(json[0].start, json[0].end), json[0].duration));
    assert(json[0].pid === process.pid);
    assert(json[1].name === 'b');
    assert(shallowEqualArrays(elapsed(json[1].start, json[1].end), json[1].duration));
    assert(json[1].pid === process.pid);
  });

  it('should set item when start', () => {
    profiler.start('a');

    const json = profiler.toJSON();
    assert(json[0].name === 'a');
    assert(json[0].start);
    assert(json[0].end == null);
    assert(json[0].duration == null);
  });

  it('should start when name is empty', () => {
    assert.throws(() => {
      profiler.start();
    }, /^AssertionError( \[ERR_ASSERTION\])?: should pass `key`$/);
  });

  it('should ignore end when name dont exist', () => {
    assert.throws(() => {
      profiler.end();
    }, /^AssertionError( \[ERR_ASSERTION\])?: should pass `key`$/);
  });

  it('should combine the async task', async () => {
    profiler.start('a');
    profiler.start('a');

    // Per [https://github.com/nodejs/node/issues/10154] there is a problem when using the high
    // resolution process.hrtime to measure accuracy of the low res uv_now (wich is the basis for
    // resolving a setTimeout callback) that sometimes lead to a 1 ms error.
    // This is the reason why 99ms and 9ms are used on comparisons.

    await sleep(100);
    const da1 = profiler.end('a');
    assert(da1[0] === 0);
    assert(da1[1] >= 99 * 1e6);

    await sleep(10);
    const da2 = profiler.end('a');
    const diff = elapsed(da1, da2);
    assert(diff[0] === 0);
    assert(diff[1] >= 9 * 1e6);

    const json = profiler.toJSON();
    assert(json.length === 1);
    assert(json[0].name === 'a');
    assert(json[0].total === 2);
    assert(json[0].counter === 2);
    assert(json[0].message === 'a x 2');
    assert(shallowEqualArrays(elapsed(json[0].start, json[0].end), json[0].duration));
    assert(json[0].pid === process.pid);
    console.log(profiler.toString());
  });

  it('should throw when end and name dont exists', () => {
    assert.throws(() => {
      profiler.end('a');
    }, /should run start\('a'\) first/);
  });

  it('should profile sync fn', () => {
    profiler.start('app launch');
    workHard(10);
    profiler.start('call xxx');
    workHard(2);
    profiler.start('load file a');
    workHard(50);
    profiler.end('load file a');

    profiler.start('load file b');
    workHard(50);
    profiler.end('load file b');
    profiler.end('call xxx');

    workHard(100);
    profiler.end('app launch');
    console.log(profiler.toString());

    const result = profiler.toJSON();
    assert(Array.isArray(result));
    assert(result.length === 4);

    result.forEach(entry => {
      assert(utility.has(entry, 'name'));
      assert(utility.has(entry, 'start'));
      assert(utility.has(entry, 'end'));
      assert(utility.has(entry, 'duration'));
      assert(utility.has(entry, 'pid'));
    });
  });

  async function asyncWork(name, timeout) {
    timeout = timeout || 10;
    profiler.start(name);
    await sleep(timeout);
    profiler.end(name);
  }

  it('should profile async fn', async () => {
    profiler.start('app launch');
    workHard(10);
    profiler.start('async operation 1');
    workHard(5);
    profiler.start('async operation 2');

    await asyncWork('async operation 3', 10);

    await sleep(10);
    profiler.end('async operation 2');
    await sleep(20);

    profiler.end('async operation 1');

    profiler.end('app launch');
    console.log(profiler.toString());
  });

  it('should profile without end fn', async () => {
    profiler.start('app launch');
    workHard(10);
    profiler.start('async operation 1');
    workHard(5);
    profiler.start('async operation 2');

    await asyncWork('async operation 3', 10);

    await sleep(10);
    profiler.end('async operation 2');
    await sleep(20);

    // profiler.end('async operation 1');

    profiler.end('app launch');
    console.log(profiler.toString());
  });

  it('allow same name, but not at same time', () => {
    profiler.start('load Controller');
    workHard(10);
    profiler.end('load Controller');

    profiler.start('load Controller');
    workHard(10);
    profiler.end('load Controller');

    console.log(profiler.toString());

    const json = profiler.toJSON();
    assert(json.length === 2);
    assert(json[0].name === 'load Controller');
    assert(json[0].start);
    assert(json[0].end);
    assert(shallowEqualArrays(json[0].duration, elapsed(json[0].start, json[0].end)));

    assert(json[1].name === 'load Controller');
    assert(json[1].start);
    assert(json[1].end);
    assert(shallowEqualArrays(json[1].duration, elapsed(json[1].start, json[1].end)));
  });

  it('should support that there is no end entry', () => {
    profiler.start('app launch');
    workHard(10);
    profiler.start('init');

    const json = profiler.toJSON();
    assert(json.length === 2);
    assert(json[0].name === 'app launch');
    assert(json[0].start);
    assert(json[0].end == null);
    assert(json[0].duration == null);

    assert(json[1].name === 'init');
    assert(json[1].start);
    assert(json[1].end == null);
    assert(json[1].duration == null);

    console.log(profiler.toString());
  });

  it('should support new profiler creation based on tag', () => {
    const anotherProfiler = timeProfile.getProfiler('test2');
    assert(profiler._name === 'default');
    assert(anotherProfiler._name === 'test2');
    assert(profiler !== anotherProfiler);
    anotherProfiler.destroy();
  });

  it('should generate same or different profilers when using corresponding tags', () => {
    const sameProfiler = timeProfile.getProfiler('default');
    assert(profiler === sameProfiler);
    const anotherProfiler = timeProfile.getProfiler('test2');
    anotherProfiler.destroy();
    const anotherProfiler2 = timeProfile.getProfiler('test2');
    assert(anotherProfiler !== anotherProfiler2);
    anotherProfiler2.destroy();
  });

  it('should profile sync functions with parameters and run them sequentially', async () => {
    // eslint-disable-next-line no-unused-vars
    for (const key of Array(5).keys()) {
      await profiler.profile(workHard, 10);
    }
    assert(profiler._list.length === 5);
    assert(profiler._list[0].name === 'workHard');
    console.log(profiler.toString());
  });

  it('should profile async functions with parameters when running in parallel', async () => {
    const asyncWorkHard = async num => await workHard(num);
    const timesParallel = async (n, fn) =>
      Promise.all(
        Array(n)
          .fill(n)
          .map(fn)
      );
    await timesParallel(5, async () => profiler.profile(asyncWorkHard, 10));
    const output = profiler.toString();
    assert(profiler._list.length === 1);
    assert(profiler._list[0].name === 'asyncWorkHard');
    assert(profiler._list[0].total === 5);
    assert(profiler._list[0].total === 5);
    assert(output.indexOf('NOT_END') === -1);
    console.log(output);
  });


  it('should profile non-anonymous function with an extra tag', async () => {
    async function namedFunc(ms) {
      await sleep(ms);
    }
    await profiler.profileTagged(namedFunc, 'tagA', 100);
    await profiler.profileTagged(namedFunc, 'tagB', 125);
    await profiler.profileTagged(namedFunc, null, 150);
    const output = profiler.toString();
    assert(output.includes('tagA'));
    assert(output.includes('tagB'));
    assert(output.includes('namedFunc'));
    console.log(output);
  });

  it('should profile anonymous function with an extra tag', async () => {
    await profiler.profileTagged(async () => {
      await sleep(100);
    }, 'tag1');
    const output = profiler.toString();
    assert(output.endsWith('tag1'));
    console.log(output);
  });

  it('should support using a different toString width output value', () => {
    profiler.profile(workHard, 10);

    const message = '';
    let output = profiler.toString(
      message,
      100
    );
    console.log(output);

    // Repeat the assertion 100 times in order to force errors in floating-point arithmetic
    // combined with Math.floor() => 99.999999999 will be rounded to 99
    Array(100)
      .fill(0)
      .forEach(() => {
        output = profiler.toString(
          message,
          100
        );
        assert(output.replace(message + '\n', '').indexOf('  [') === 100);
      });
  });

  it('should show a negligible time function', async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const syncFn = a => a;
    await profiler.profile(sleep, 10);
    await profiler.profile(syncFn, 1);
    let output = profiler.toString();
    console.log(output);
    output = output.split('\n');
    assert(output[output.length - 1].split('▇').length - 1 === 1);
  });

  it('should work when the task is shorter than the maximum output width', async () => {
    const syncFn = a => a;
    await profiler.profile(syncFn, 1);
    const maxWidth = 1e9; // this should be bigger than syncFn(1) exec time in ns
    const outputLength = profiler.toString(
      '',
      maxWidth
    ).length;
    assert(outputLength < 1e9);
  });
});
