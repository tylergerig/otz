var socket = io.connect(location);
var world;
socket.on('world', function(data) {
  world = data;
  jwerty.key('a/arrow-left', function() {
    socket.emit("move", {dir: "left"})
    event.preventDefault();
  });
  jwerty.key('d/arrow-right', function() {
    socket.emit("move", {dir: "right"})
    event.preventDefault();
  });
  jwerty.key('w/arrow-up', function() {
    socket.emit("move", {dir: "up"})
    event.preventDefault();
  });
  jwerty.key('s/arrow-down', function(e) {
    socket.emit("move", {dir: "down"})
    event.preventDefault();
  });
  jwerty.key('f/space', function(e) {
    socket.emit('shoot');
    event.preventDefault();
  });
  render();
  renderPlayers(world.players);
  renderPlayer(world.player, true);
});
socket.on('moved', function(data) {
  var you = false;
  if(data.player.id === world.player.id) {
    world.player.location = data.player.location;
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

socket.on('quit', function(data) {
  console.log('quit');
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