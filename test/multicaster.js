var assert = require('assert')
  , dgram  = require('dgram')
  , multicaster = require('../');

var options = { port: 9000 }
  , mc = multicaster(options);

assert(mc.listener);
assert(mc instanceof require('events').EventEmitter);
mc.destroy();
