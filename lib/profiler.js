'use strict';

const assert = require('assert');
const EventEmitter = require('events');

const Entry = require('./entry');

const _profilers = new Map();

const isPromise = value =>
  value !== null && typeof value === 'object' && typeof value.then === 'function';

class Profiler extends EventEmitter {
  constructor(name) {
    super();
    this._map = new Map(); // <key, index>
    this._list = []; // entry stack
    this._start = null;
    this._lastEnd = null;
    this._name = name;
  }

  async profileTagged(fn, tag, ...args) {
    const id = tag ? tag : fn.name;
    this.start(id);
    let ret = fn(...args);
    if (isPromise(ret)) {
      ret = await ret;
    }
    this.end(id);
    return ret;
  }

  async profile(fn, ...args) {
    return this.profileTagged(fn, fn.name, ...args);
  }


  start(key) {
    assert(key !== null && key !== undefined, 'should pass `key`');

    let entry;
    if (this._map.has(key)) {
      const index = this._map.get(key);
      entry = this._list[index];
      entry.total++;
    } else {
      entry = new Entry(key);
      const size = this._list.push(entry);
      this._map.set(key, size - 1);
    }
    if (!this._start) {
      this._start = entry.start;
    }
  }

  end(key) {
    assert(key !== null && key !== undefined, 'should pass `key`');
    assert(this._map.has(key), 'should run start(\'' + key + '\') first');

    const index = this._map.get(key);
    const entry = this._list[index];
    if (entry.markEnd()) {
      this._map.delete(key);
    }
    this._lastEnd = entry.end;

    return entry.duration;
  }

  reset() {
    this._list = [];
    this._map.clear();
    this._start = null;
    this._lastEnd = null;
  }

  destroy() {
    this.reset();
    _profilers.delete(this._name);
    this._name = '';
  }

  toJSON() {
    return this._list;
  }

  toString(prefix = '', width = 50) {
    return (
      prefix +
      '\n' +
      this._list
        .map(entry =>
          entry.toString(
            this._start,
            this._lastEnd,
            width
          )
        )
        .join('\n')
    );
  }
}

function getProfiler(name) {
  name = name || 'default';
  let p = _profilers.get(name);
  if (p === undefined) {
    p = new Profiler(name);
    _profilers.set(name, p);
  }
  return p;
}

module.exports = { getProfiler };
