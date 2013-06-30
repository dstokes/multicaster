var util  = require('util')
  , dgram = require('dgram')
  , myip  = require('my-local-ip')()
  , EventEmitter = require('events').EventEmitter;

module.exports = Multicaster;

util.inherits(Multicaster, EventEmitter);

function Multicaster(options) {
  if(!(this instanceof Multicaster)) {
    return new Multicaster(options);
  }
  EventEmitter.call(this);

  options = (options || {});
  this.port = (options.port || 3000);
  this.listener = dgram.createSocket('udp4', this._handleMessage);
  this.listener.bind(this.port);
}

Multicaster.prototype._handleMessage = function(msg, src) {
  src = (src || {});
  // filter out messages from this process
  if(src.address === myip) return;

  this.emit('message', msg, src);
}

Multicaster.prototype.broadcast = function(msg, options) {
  if(! this.emitter) {
    this.emitter = dgram.createSocket('udp4');
  }

  options = (options || {});
  var port = (this.port || options.port);
  var address = (options.address || '224.0.0.1');

  // try to encode message
  msg = (msg || '');
  if(typeof msg === 'object') {
    try {
      msg = JSON.stringify(msg);
    } catch(e) {
      return this.emit('error', e);
    }
  }
  msg = new Buffer(msg);
  this.emitter.send(msg, 0, msg.length, port, address)
}

Multicaster.prototype.destroy = function() {
  if(this.listener) this.listener.close();
  if(this.emitter) this.emitter.close();
}
