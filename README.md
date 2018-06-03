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
[travis-image]: https://img.shields.io/travis/node_modules/time-profile.svg?style=flat-square
[travis-url]: https://travis-ci.org/node_modules/time-profile
[codecov-image]: https://codecov.io/github/node_modules/time-profile/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node_modules/time-profile?branch=master
[david-image]: https://img.shields.io/david/node_modules/time-profile.svg?style=flat-square
[david-url]: https://david-dm.org/node_modules/time-profile
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

const profiler = timeProfile.getInstance('aProfiler');

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
