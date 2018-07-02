# time-profile
Measuring execution time of functions

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/time-profile.svg?style=flat-square
[npm-url]: https://npmjs.org/package/time-profile
[travis-image]: https://img.shields.io/travis/node-modules/time-profile.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/time-profile
[codecov-image]: https://codecov.io/github/node-modules/time-profile/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/time-profile?branch=master
[david-image]: https://img.shields.io/david/node-modules/time-profile.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/time-profile
[snyk-image]: https://snyk.io/test/npm/time-profile/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/time-profile
[download-image]: https://img.shields.io/npm/dm/time-profile.svg?style=flat-square
[download-url]: https://npmjs.org/package/time-profile

A Tool to help you to measure execution time of functions.

## Install

```bash
$ npm install time-profile
```

## Usage

```js
const timeProfile = require('time-profile');

const profiler = timeProfile.getProfiler('aProfiler');

profiler.start('app launch');
// ... do work

profiler.start('load plugins');
// ... load plugins
profiler.end('load plugins');

profiler.start('load services');
// ... load services
profiler.end('load services');

profiler.start('init');
// ... init
profiler.end('init');

// ...
profiler.end('app launch');

// in the end, you can dump the profile data to a json
const json = profiler.toJSON(); // [ Entry { name, start, end, duration, pid }, ... ]

// also you can print the profile timeline
console.log(profiler.toString('this is timeline:'));

// you shoud destroy it when it's not needed anymore
profiler.destroy();
```

```bash
this is timeline:
▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [172ms] - app launch
  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [91ms] - load plugins
   ▇▇▇▇▇▇▇▇▇▇▇▇▇  [47ms] - load services
                 ▇▇▇▇▇▇▇▇▇▇▇  [41ms] - init
```

Profilers are created based on tags, and can be accessed from any scope. You can also use a simplified `profiler.profile(fn, ...params)` to measure a specific async or sync function

```js
const profiler = timeProfile.getInstance('anotherProfiler');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const syncFn = (a, b) => a + b;
await profiler.profile(sleep, 10);
await profiler.profile(syncFn, 1, 3);

// You can even specify a different toString width output value
console.log(profiler.toString('this is timeline:', 40));
```

```bash
▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [9.703106 ms] - sleep
                                                                       ▇  [56.503 μs] - syncFn
```

Or use `profiler.profileTagged(fn, tag, ...params)` if you want to change the tag or profile and anonymous function  

```js
await profiler.profileTagged(sleep, 'tagA', 100);
await profiler.profileTagged(sleep, 'tagB', 125);
await profiler.profileTagged(sleep, null, 150);
console.log(profiler.toString('this is timeline:'));
```


```bash
this is timeline:
▇▇▇▇▇▇▇▇▇▇▇▇▇  [101.674214 ms] - tagA
                       ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [125.914368 ms] - tagB
                                                   ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [150.5361 ms] - sleep
```

