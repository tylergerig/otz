var socket = io.connect(location);
var world;
socket.on('world', function(data) {
  world = data;
  jwerty.key('a/arrow-left', function() {
    socket.emit("move", {dir: "left"})
  });
  jwerty.key('d/arrow-right', function() {
    socket.emit("move", {dir: "right"})
  });
  jwerty.key('w/arrow-up', function() {
    socket.emit("move", {dir: "up"})
  });
  jwerty.key('s/arrow-down', function(e) {
    socket.emit("move", {dir: "down"})
    event.preventDefault();
  });
  render();
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

var renderPlayer = function(player, you) {
  var move = true;
  var $el = $("#"+player.id);
  if(!$el.length) {
    $el = $("<div>").attr('id', player.id).addClass('player').hide().appendTo('.world');
    console.log(you);
    if(you) $el.addClass('you');
    move = false;
  }
  var offset = $(".row:eq("+player.location.y+") .cell:eq("+player.location.x+")").offset();
  if(move) {
    $el.animate(offset, 500/player.speed, "linear");
  } else {
    $el.css(offset).fadeIn();
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
      //if(world.player.location.x === j && world.player.location.y === i)
      //  $cell.append("X");
      $row.append($cell.addClass(world.map[i][j].material));
    }
  }
};
