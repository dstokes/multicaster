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

  var self = this;
  options = (options || {});
  this.port = (options.port || 3000);
  this.socket = dgram.createSocket('udp4');
  this.socket.on('message', this.onMessage.bind(this));
  this.socket.on('error', function(e) { this.emit('error', e) });
  this.socket.bind(this.port);
}

Multicaster.prototype.onMessage = function(msg, src) {
  src = (src || {});
  // filter out messages from this process
  if(src.address === myip && src.port === this.port) return;
  this.emit('message', msg, src);
}

Multicaster.prototype.broadcast = function(msg, options) {
  options = (options || {});
  var port = (options.port || this.port);
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
  this.socket.send(msg, 0, msg.length, port, address)
}

Multicaster.prototype.destroy = function() {
  if(this.socket) this.socket.close();
}
