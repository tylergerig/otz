var express = require('express');
var http = require('http');
var otz = require('./lib/otz');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/img/favicon.png'));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var server = http.createServer(app);
otz.listen(server);

app.get('/', function(req, res) { res.render('index'); });

server.listen(app.get('port'), function(){
  console.log("OTZ server listening on port " + app.get('port'));
});


