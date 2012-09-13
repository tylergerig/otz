var EventEmitter = require('events').EventEmitter;
var util = require('util'); 
var moniker = require('moniker');
var autoId = 0;
var RESPAWN_TIME = 3000;

module.exports = Mob = function(io, map, cb) {
  var self = this;

  var mob = {
    id: "m"+autoId++,
    location: map.random(),
    dir: "up",
    speed: 5,
    lastMoved: null,
    lastShot: null,
    alive: true,
	nick: getNick(),
	type: "mob"
  };  

  mob.spawn = function() {
    mob.location = map.random();
	if(!mob.alive) {
      mob.alive = true;
      io.sockets.emit('player-moved', {player: mob});
    }
  };
  
  mob.spawn();
    
  mob.die = function(killer) {
	killer.addExp(5);
    mob.alive = false;
    io.sockets.emit('player-killed', {player:mob, killer: killer});
    setTimeout(mob.spawn, RESPAWN_TIME);
  }
  
  function getNick() {
    var nick;
    for(var i = 0; i < 1000; i++) {
      nick = moniker.choose();
	  nick = "mob-" + nick;
      return nick;
    }
    throw new Error("Could not generate a unique nick.");
  }

  return mob;
};
