var socketio = require('socket.io');
var Map = require('./map');
var Player = require('./player');

var game = function(io) {
  var world = {};

  world.map = new Map(32,32);
  world.players = [];

  var addPlayer = function(io, socket) {
    world.players.push(new Player(io, socket, world.map));
  };
  var removePlayer = function(socket) {
    /*var i = world.players.indexOf(socket);
    world.players[i].destroy();
    delete world.players[i];*/
  }

  io.on('connection', function(socket) {
    addPlayer(io, socket);
    socket.on('disconnect', function() {
      removePlayer(socket);
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
