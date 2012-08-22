var EventEmitter = require('events').EventEmitter;
var Bullet = require('./bullet');
var util = require('util'); 
var moniker = require('moniker');
var autoId = 0;
var RESPAWN_TIME = 3000;

module.exports = Player = function(io, socket, map, players, world, cb) {
  var self = this;

  var player = {
    id: "p"+autoId++,
    location: map.random(),
    speed: 5,
    lastMoved: null,
    lastShot: null,
    alive: true,
    nick: getNick()
  };
  socket.playerId = player.id;

  player.spawn = function() {
    player.location = map.random();
    if(!player.alive) {
      player.alive = true;
      io.sockets.emit('moved', {player: player});
    }
  };

  player.spawn();
  socket.emit('world', {map: map.cells, player: player, players: players});
  io.sockets.emit('player-joined', {player: player});
  io.sockets.emit('moved', {player: player});
  socket.on('move', function(data) {
    var loc;
  
    if(!player.alive) return;
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
      player.dir = data.dir;
      player.location = loc;
      io.sockets.emit('moved', {player: player});
    }
  });

  socket.on('shoot', function(data) {
    if(!player.alive) return;
    console.log((new Date() - player.lastShot) < 500 / player.speed);
    if((new Date() - player.lastShot) < 500) return;
    player.lastShot = new Date();
    world.bullets.push(new Bullet(player, map));
  });

  socket.on('nick', function(data) {
    if(nickInUse(data.nick)) {
      socket.emit('error', {message: "Nick already in use."});
      return;
    }
    var oldNick = player.nick;
    player.nick = data.nick;
    io.sockets.emit('player-nick', {player: player, oldNick: oldNick});
  });

  function nickInUse(nick) {
    var used = false;
    players.forEach(function(player) {
      if(player.nick === nick) {
        used = true;
        return false;
      }
    });
    return used;
  }

  function getNick() {
    var nick;
    for(var i = 0; i < 1000; i++) {
      nick = moniker.choose();
      if(!nickInUse(nick)) {
        return nick;
      }
    }
    throw new Error("Could not generate a unique nick.");
  }

  player.destroy = function() {
    io.sockets.emit('player-quit', {player: player});
  };

  player.die = function(killer) {
    player.alive = false;
    io.sockets.emit('player-died', {player:player, killer: killer});
    setTimeout(player.spawn, RESPAWN_TIME);
  }

  return player;
};

util.inherits(Player, EventEmitter);
