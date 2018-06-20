'use strict';

const Profiler = require('..');
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
  const profiler = new Profiler();

  beforeEach(() => {
    profiler.reset();
  });

  it('should trace', () => {
    profiler.start('a');
    const da = profiler.end('a');
    profiler.start('b');
    const db = profiler.end('b');

    assert.strictEqual(typeof da, 'number');
    assert.strictEqual(typeof db, 'number');

    const json = profiler.toJSON();
    assert(json.length === 2);

    assert(json[0].name === 'a');
    assert(json[0].end - json[0].start === json[0].duration);
    assert(json[0].pid === process.pid);
    assert(json[1].name === 'b');
    assert(json[1].end - json[1].start === json[1].duration);
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

  it('should ignore start when name is empty', () => {
    profiler.start();

    const json = profiler.toJSON();
    assert(json.length === 0);
  });

  it('should ignore end when name dont exist', () => {
    profiler.end();
    assert(profiler.toJSON().length === 0);
  });

  it('should combine the async task', async () => {
    profiler.start('a');
    profiler.start('a');

    await sleep(100);
    const da1 = profiler.end('a');
    assert(da1 >= 100);

    await sleep(10);
    const da2 = profiler.end('a');
    assert(da2 - da1 >= 10);

    const json = profiler.toJSON();
    assert(json.length === 1);
    assert(json[0].name === 'a');
    assert(json[0].total === 2);
    assert(json[0].counter === 2);
    assert(json[0].message === 'a x 2');
    assert(json[0].end - json[0].start === json[0].duration);
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

  async function asyncWork(name, timeout = 10) {
    profiler.start(name);
    await sleep(timeout);
    profiler.end(name);
  }

  it('should profiler async fn', async function() {
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

  it('should profiler not end fn', async function() {
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
    assert(json[0].duration === json[0].end - json[0].start);

    assert(json[1].name === 'load Controller');
    assert(json[1].start);
    assert(json[1].end);
    assert(json[1].duration === json[1].end - json[1].start);
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
});
