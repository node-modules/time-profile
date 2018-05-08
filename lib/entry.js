'use strict';

function repeat(char, num) {
  if (!num) return '';
  const arr = new Array(num);
  arr.fill(char);
  return arr.join('');
}

class Entry {
  constructor(name) {
    this.name = name;
    this.start = Date.now();
    this.end = null;
    this.duration = null;
    this.pid = process.pid;
    this.total = 1;
    this.counter = 0;
  }

  get isEnd() {
    return this.end != null;
  }

  get message() {
    return this.total > 1 ? (this.name + ' x ' + this.total) : this.name;
  }

  markEnd() {
    this.end = Date.now();
    this.duration = this.end - this.start;
    this.counter++;
    return this.counter === this.total;
  }

  toString(start, end) {
    start = start || this.start;
    end = end || this.end || Date.now();
    const totalRT = end - start;
    const selfStart = this.start;
    const duration = this.isEnd ? this.duration : (Date.now() - selfStart);

    let times = 1;
    if (totalRT > 50) {
      times = 50 / totalRT;
    }
    const status = this.isEnd ? (duration + 'ms') : 'NOT_END';
    const timespan = Math.floor(times * (selfStart - start));
    let timeline = Math.floor(duration * times);
    timeline = timeline > 0 ? timeline : 1; // make sure there is at least one unit
    return repeat(' ', timespan) + repeat('▇', timeline) + '  [' + status + '] - ' + this.message;
  }
}

module.exports = Entry;
