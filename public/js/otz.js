var socket = io.connect(location); // Use "peterwooley.com:4242" to play on the live server
var world;

socket.on('game-enter', function(data) {
  world = data;
  renderMap(world.map);
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
  renderBullet(data.bullet);
});
socket.on('bullet-destroyed', function(data) {
  removeBullet(data.bullet);
});

socket.on('player-killed', function(data) {
  killPlayer(data.player, data.killer);
});

/* Helper Methods */

var renderMap= function(map) {
  $world = $(".world");
  $world.empty();
  for(var i = 0; i < map.length; i++) {
    $row = $("<div>").addClass("row");
    $world.append($row);
    for(var j = 0; j < map[i].length; j++) {
      var $cell = $("<div>").addClass('cell');
      $row.append($cell.addClass(map[i][j].material));
    }
  }
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
};

var renderPlayers = function(players) {
  for(var i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  }
};

var killPlayer = function(player, killer) {
  var $el = $("#"+player.id);
  $el.fadeOut(500, function() { $(this).remove() });
};

var removePlayer = function(player) {
  $("#"+player.id).remove();
};

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
  $("#"+bullet.id).remove();
}

var toast = function(message) { $().toastmessage('showNoticeToast', message); };
