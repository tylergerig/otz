var EventEmitter = require('events').EventEmitter;
var util = require('util'); 
var autoId = 0;

module.exports = Player = function(io, socket, map, cb) {
  var self = this;

  var player = {
    id: "p"+autoId++,
    location: map.random(),
    speed: 5,
    lastMoved: null
  };

  socket.emit('world', {map: map.cells, player: player});
  socket.on('move', function(data) {
    var loc;

    if((new Date() - player.lastMoved) < 500 / player.speed) return;

    switch(data.dir) {
      case "left":
        if(map.isNavigable(player.location.x-1, player.location.y))
          loc = map.cells[player.location.y][player.location.x-1]
        break;
      case "right":
        if(map.isNavigable(player.location.x+1, player.location.y))
          loc = map.cells[player.location.y][player.location.x+1]
        break;
      case "up":
        if(map.isNavigable(player.location.x, player.location.y-1))
          loc = map.cells[player.location.y-1][player.location.x]
        break;
      case "down":
        if(map.isNavigable(player.location.x, player.location.y+1))
          loc = map.cells[player.location.y+1][player.location.x]
        break;
    }
    if(loc) {
      player.lastMoved = new Date();
      player.location = loc;
      io.sockets.emit('moved', {player: player});
    }
  });

  return player;
};

util.inherits(Player, EventEmitter);
