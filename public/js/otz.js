var socket = io.connect(location);
var world;
socket.on('game-enter', function(data) {
  world = data;
  jwerty.key('a/arrow-left', function() {
    socket.emit("player-move", {dir: "left"})
    event.preventDefault();
  });
  jwerty.key('d/arrow-right', function() {
    socket.emit("player-move", {dir: "right"})
    event.preventDefault();
  });
  jwerty.key('w/arrow-up', function() {
    socket.emit("player-move", {dir: "up"})
    event.preventDefault();
  });
  jwerty.key('s/arrow-down', function(e) {
    socket.emit("player-move", {dir: "down"})
    event.preventDefault();
  });
  jwerty.key('f/space', function(e) {
    socket.emit('player-shoot');
    event.preventDefault();
  });
  jwerty.key('e', function(e) {
    turn(true);
  });
  jwerty.key('q', function(e) {
    turn();
  });
  var turn = function(right) {
    var dir = world.player.dir;
    var dirs = ["up", "right", "down", "left"];
    var cur = dirs.indexOf(dir);
    var val = cur + (right ? 1 : -1);
    if(val == -1) val = dirs.length-1;
    if(val >= dirs.length) val = 0;
    socket.emit('player-turn', {dir: dirs[val]});
    
  };

  render();
  renderPlayers(world.others);
  renderPlayer(world.player, true);

  });
socket.on('player-moved', function(data) {
  var you = false;
  if(data.player.id === world.player.id) {
    world.player.location = data.player.location;
    world.player.dir = data.player.dir;
    you = true;
  }
  renderPlayer(data.player, you);
});

socket.on('bullet-moved', function(data) {
  console.log('bullet-moved');
  renderBullet(data.bullet);
});

socket.on('bullet-destroyed', function(data) {
  removeBullet(data.bullet);
});

var renderBullet = function(bullet) {
  var move = true;
  var $el = $("#"+bullet.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', bullet.id).addClass('bullet').hide().appendTo('.world');
    move = false;
  }
  var offset = $(".row:eq("+bullet.location.y+") .cell:eq("+bullet.location.x+")").position();
  if(move) {
    $el.animate(offset, 100, "linear");
  } else {
    $el.css(offset).show();
  }
};

var removeBullet = function(bullet) {
  $("#"+bullet.id).addClass('destroyed').fadeOut("fast", function() { $(this).remove(); });
}

socket.on('player-nick-changed', function(data) {
  toast(data.oldNick + " is now known as " + data.player.nick);
});

socket.on('player-died', function(data) {
  killPlayer(data.player, data.killer);
});

socket.on('player-joined', function(data) {
  toast(data.player.nick + " has joined the fray!");
});

socket.on('player-quit', function(data) {
  toast(data.player.nick + " has left the fray!");
  removePlayer(data.player);
});

var removePlayer = function(player) {
   $("#"+player.id).remove();
};

var renderPlayers = function(players) {
  for(var i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

var killPlayer = function(player, killer) {
  var $el = $("#"+player.id);

  var angle = 0;
  if(player.dir) {
    if(player.dir === 'right') angle = 90;
    else if(player.dir === 'down') angle = 180;
    else if(player.dir === 'left') angle = 270;
  }

  // Add some randomness
  angle += Math.floor(Math.random() * 50 - 25);

  $el.css('transform', 'rotate('+angle+'deg)');
  $el.fadeOut(500, function() { $(this).remove() });

  toast(killer.nick + " killed " + player.nick);
};

var renderPlayer = function(player, you) {
  var move = true;
  var $el = $("#"+player.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', player.id).addClass('player').hide().appendTo('.world');
    if(you) $el.addClass('you');
    move = false;
  }
  var offset = $(".row:eq("+player.location.y+") .cell:eq("+player.location.x+")").position();
  if(move) {
    $el.animate(offset, 500/player.speed, "linear");
  } else {
    $el.css(offset).fadeIn();
  }

  if(player.dir) {
    var angle = "0deg";
    if(player.dir === 'right') angle = '90deg';
    else if(player.dir === 'down') angle = '180deg';
    else if(player.dir === 'left') angle = '270deg';

    $el.css('transform', 'rotate('+angle+')');
  }
};

socket.on('disconnect', function() {
  toast('Lost connection to the game server.');
});

socket.on('reconnect', function() {
  toast('Reconnected to the game server.');
});

var render = function() {
  $world = $(".world");
  $world.empty();
  for(var i = 0; i < world.map.length; i++) {
    $row = $("<div>").addClass("row");
    $world.append($row);
    for(var j = 0; j < world.map[i].length; j++) {
      var $cell = $("<div>").addClass('cell');
      $row.append($cell.addClass(world.map[i][j].material));
    }
  }
};

var toast = function(message) {
  $().toastmessage('showNoticeToast', message);
};
