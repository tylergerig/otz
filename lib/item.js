/* TODO Get items working... */
var EventEmitter = require('events').EventEmitter;
var util = require('util'); 
var moniker = require('moniker');
var autoId = 0;
var RESPAWN_TIME = 20000;

module.exports = Item = function(io, map, cb) {
  var self = this;

  var item = {
    id: "n"+autoId++,
    location: map.random(),
    dir: "up",
    speed: 5,
    lastMoved: null,
    lastShot: null,
    alive: true,
	nick: getNick(),
	type: "item"
  };  

  item.spawn = function() {
    item.location = map.random();
	if(!item.alive) {
      item.alive = true;
      io.sockets.emit('player-moved', {player: item});
    }
  };
  
  item.spawn();
    
  item.die = function(killer) {
	killer.addSpeed(3000);
    item.alive = false;
    io.sockets.emit('item-killed', {player: item, killer: killer});
    setTimeout(item.spawn, RESPAWN_TIME);
  }
  
  function getNick() {
    var nick;
    for(var i = 0; i < 1000; i++) {
      nick = moniker.choose();
	  nick = "item-" + nick;
      return nick;
    }
    throw new Error("Could not generate a unique nick.");
  }

  return item;
};
