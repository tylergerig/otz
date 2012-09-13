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
  if(move && you) {
    $el.animate(offset, 500/player.speed, "linear");
	if(player.dir === "left") {
		$el.css("background", "url('../img/youleft.png') no-repeat center center");
	}
	else if(player.dir === "right") {
		$el.css("background", "url('../img/youright.png') no-repeat center center");
	}
	else if(player.dir === "up") {
		$el.css("background", "url('../img/youup.png') no-repeat center center");
	}
	else if(player.dir === "down") {
		$el.css("background", "url('../img/youdown.png') no-repeat center center");
	}
  } else if(move) {
	$el.animate(offset, 500/player.speed, "linear");
	if(player.dir === "left") {
	
		$el.css("background", "url('../img/enleft.png') no-repeat center center");
	}
	else if(player.dir === "right") {
		$el.css("background", "url('../img/enright.png') no-repeat center center");
	}
	else if(player.dir === "up") {
		$el.css("background", "url('../img/enup.png') no-repeat center center");
	}
	else if(player.dir === "down") {
		$el.css("background", "url('../img/endown.png') no-repeat center center");
	}
  } else {
    $el.css(offset).fadeIn();
  }
};
var potion = function(item){
	if(world.player.type === "item" ){
		$el.css("background", "url('../img/endown.png') no-repeat center center");
	}
};
var renderPlayers = function(players) {
  for(var i = 0; i < players.length; i++) {
    renderPlayer(players[i]);
  } 
};

var renderMob = function(mob) {
  for(var i = 0; i < mob.length; i++) {
    renderMob(mob[i]);
  }    
};
var renderItem = function(item) {
  for(var i = 0; i < item.length; i++) {
    renderItem(item[i]);
  }

};

var killPlayer = function(player, killer) {
  var $el = $("#"+player.id);
  $el.fadeOut(500, function() { $(this).remove() });

};

var killMob = function(mob, killer) {
  var $el = $("#"+mob.id);
  $el.fadeOut(500, function() { $(this).remove() });

};
var killItem = function(item, killer) {
  var $el = $("#"+item.id);
  $el.fadeOut(500, function() { $(this).remove() });

};

var removePlayer = function(player) {
  $("#"+player.id).remove();
};
var removeMob = function(mob) {
  $("#"+mob.id).remove();
};
var removeItem = function(item) {
  $("#"+item.id).remove();
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
	if(bullet.dir === "left") {
		$el.css("transform", "rotate(270deg)");
	}
	else if(bullet.dir === "right") {
		$el.css("transform", "rotate(90deg)");
	}
	else if(bullet.dir === "up") {
		$el.css("transform", "rotate(0deg)");
	}
	else if(bullet.dir === "down") {
		$el.css("transform", "rotate(180deg)");
	}
  } else {
    $el.css(offset).show();
  }
};

var removeBullet = function(bullet) {
  $("#"+bullet.id).remove();
}

var toast = function(message) { $().toastmessage('showNoticeToast', message); };

socket.on('player-joined', function(data){
  toast(world.player.nick + " has joined.");
});

socket.on('disconnect', function() {
   toast(world.player.nick + " has left.");
});

socket.on('reconnect', function() {
   toast(world.player.nick + " has rejoined.");
});

socket.on('player-quit', function(data) {
  toast(data.player.nick + " quit.");
  removePlayer(data.player);
});

socket.on('player-killed', function(data) {
  toast(data.killer.nick + " killed " + data.player.nick);
  toast(data.killer.nick + " got " + data.killer.exp + " exp.");
});

socket.on('mob-killed', function(data) {
  toast(data.killer.nick + " killed " + data.mob);
  toast(data.killer.nick + " got " + data.killer.exp + " exp.");
});

socket.on('item-killed', function(data) {
  toast(data.killer.nick + " killed " + data.item);
  toast(data.killer.nick + " your speed has increased to " + data.killer.speed);
});


socket.on('player-leveled', function(data) {
  toast(data.player.nick + " is now level " + data.player.level);
 if(data.player.id === world.player.id){  
  world.player.speed = data.player.speed;
  
 }  
});

jwerty.key('up', function(event){
	event.preventDefault();
	socket.emit('player-move', {dir: 'up'});
});
jwerty.key('down', function(event){
	event.preventDefault();
	socket.emit('player-move', {dir: 'down'});
});
jwerty.key('left', function(event){
	event.preventDefault();
	socket.emit('player-move', {dir: 'left'});
});
jwerty.key('right', function(event){
	event.preventDefault();
	socket.emit('player-move', {dir: 'right'});
});

jwerty.key('w', function(event){
	event.preventDefault();
	socket.emit('player-turn', {dir: 'up'});
});
jwerty.key('s', function(event){
	event.preventDefault();
	socket.emit('player-turn', {dir: 'down'});
});
jwerty.key('a', function(event){
	event.preventDefault();
	socket.emit('player-turn', {dir: 'left'});
});
jwerty.key('d', function(event){
	event.preventDefault();
	socket.emit('player-turn', {dir: 'right'});
});


jwerty.key('space', function(event){
	event.preventDefault();
	socket.emit('player-shoot');
});
