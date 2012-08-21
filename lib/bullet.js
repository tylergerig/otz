var EventEmitter = require('events').EventEmitter;
var util = require('util'); 
var autoId = 0;

module.exports = Bullet = function(player, map) {
  var self = this;

  var bullet = {
    id: "b"+autoId++,
    location: player.location,
    dir: player.dir,
    speed: 10,
    lastMoved: null,
    owner: player
  };

  bullet.move = function(sockets, world) {
    var loc;

    if((new Date() - bullet.lastMoved) < 500 / bullet.speed) return;

    switch(bullet.dir) {
      case "left":
        if(map.isNavigable(bullet.location.x-1, bullet.location.y))
          loc = map.cells[bullet.location.y][bullet.location.x-1]
        break;
      case "right":
        if(map.isNavigable(bullet.location.x+1, bullet.location.y))
          loc = map.cells[bullet.location.y][bullet.location.x+1]
        break;
      case "up":
        if(map.isNavigable(bullet.location.x, bullet.location.y-1))
          loc = map.cells[bullet.location.y-1][bullet.location.x]
        break;
      case "down":
        if(map.isNavigable(bullet.location.x, bullet.location.y+1))
          loc = map.cells[bullet.location.y+1][bullet.location.x]
        break;
    }
    if(loc) {
      bullet.lastMoved = new Date();
      bullet.location = loc;
      sockets.emit('bullet-moved', {bullet: bullet});
    } else {
      sockets.emit('bullet-destroyed', {bullet: bullet});
      world.bullets.splice(world.bullets.indexOf(bullet), 1);
    }
  }
  
  bullet.destroy = function() {
    io.sockets.emit('bullet-destroyed', {player: player});
  };

  return bullet;
};

util.inherits(Bullet, EventEmitter);
