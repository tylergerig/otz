var socketio = require('socket.io');
var Map = require('./map');

var game = function(io) {
  var world = {};

  world.map = new Map(64,16);
  world.players = [];

  io.on('connection', function(socket) {
    var player = {location: world.map.random()};
    socket.emit('world', {map: world.map.cells, player: player});
    socket.on('move', function(data) {
      var loc;
      switch(data.dir) {
        case "left":
          if(world.map.isNavigable(player.location.x-1, player.location.y))
            loc = world.map.cells[player.location.y][player.location.x-1]
          break;
        case "right":
          if(world.map.isNavigable(player.location.x+1, player.location.y))
            loc = world.map.cells[player.location.y][player.location.x+1]
          break;
        case "up":
          if(world.map.isNavigable(player.location.x, player.location.y-1))
            loc = world.map.cells[player.location.y-1][player.location.x]
          break;
        case "down":
          if(world.map.isNavigable(player.location.x, player.location.y+1))
            loc = world.map.cells[player.location.y+1][player.location.x]
          break;
      }
      if(loc) {
        player.location = loc;
        socket.emit('moved', {location: player.location})
      }
    });
  });

  return {
    register: function(req, res, next) {
      // TODO Register new player.
    }
  }
};

module.exports = {
  listen: function(server) {
    var io = socketio.listen(server);
    return game(io);
    
  },
}
