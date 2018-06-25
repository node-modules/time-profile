'use strict';

const hrtime = require('./hrtime');

function repeat(char, num) {
  if (!num) return '';
  const arr = new Array(num);
  arr.fill(char);
  return arr.join('');
}

class Entry {
  constructor(name) {
    this.name = name;
    this.start = process.hrtime();
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
    this.end = process.hrtime();
    this.duration = hrtime.elapsed(this.start, this.end);
    this.counter++;
    return this.counter === this.total;
  }

  toString(origin, expiration, width = 50) {
    origin = origin || this.start;
    expiration = expiration || this.end || process.hrtime();

    const hrtimeDuration = this.isEnd ? this.duration : process.hrtime(this.start);
    const totalRT = hrtime.nano(hrtime.elapsed(origin, expiration));
    const offset = hrtime.nano(hrtime.elapsed(origin, this.start));
    const duration = hrtime.nano(hrtimeDuration);

    let times = 1;
    if (totalRT > width) {
      times = width / totalRT;
    }

    const status = this.isEnd ? hrtime.prettyHrtime(hrtimeDuration, { precise: true }) : 'NOT_END';
    const timespan = Math.floor((offset * times).toFixed(6));
    let timeline = Math.floor((duration * times).toFixed(6));
    timeline = timeline > 0 ? timeline : 1; // make sure there is at least one unit
    return repeat(' ', timespan) + repeat('▇', timeline) + '  [' + status + '] - ' + this.message;
  }
}

module.exports = Entry;
