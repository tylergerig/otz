var socketio = require('socket.io');
var Map = require('./map');
var Player = require('./player');
var Mob = require('./mob');
var Item = require('./item');

var game = function(io) {
  var world = {};

  world.map = new Map(32,32);
  world.players = [];
  world.players.push(new Mob(io, world.map));
  world.players.push(new Mob(io, world.map));
  world.players.push(new Mob(io, world.map));
  world.players.push(new Mob(io, world.map));
  world.players.push(new Item(io, world.map));
  world.bullets = [];

  var addPlayer = function(io, socket) {
    world.players.push(new Player(io, socket, world.map, world.players, world));
  };
  var removePlayer = function(socket) {
    for(var i = 0; i < world.players.length; i++) {
      if(world.players[i].id === socket.playerId) {
        world.players[i].destroy();
        world.players.splice(i, 1);
      }
    }
  }

  io.on('connection', function(socket) {
    addPlayer(io, socket);
    socket.on('disconnect', function() {
      removePlayer(socket);
    });
  });

  var moveBullets = function() {
    if(!world.bullets.length) return;

    world.bullets.forEach(function(bullet) {
      bullet.move(io.sockets, world);
    });
  }

  setInterval(moveBullets, 100);

  world.players.hit = function(x, y, bullet) {
    var hit = false;
    this.forEach(function(player) {
      if(!player.alive) return true;
      if(player.location.x == x && player.location.y == y && player !== bullet.owner) {
        // A hit!
        hit = player;
        return false;
      }
    });
    return hit;
  }

  return {
    register: function(req, res, next) {
      // TODO Register new player.
    }
  }

};


module.exports = {
  listen: function(server) {
    var io = socketio.listen(server, {"log level": 1});
    return game(io);
    
  }
}
