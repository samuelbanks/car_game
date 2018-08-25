var fs      = require('fs');
var express = require('express');
var http    = require('http');
var https   = require('https');
var path    = require('path');
var socket  = require('socket.io')
var XHash   = require('xxhash');
 // var mongo   = require('mongodb');
require('./server/multiplayer');

var privateKey  = fs.readFileSync('certs/privkey.pem',   'utf8');
var certificate = fs.readFileSync('certs/fullchain.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };

var httpApp = express();
var app = express();
var port = process.env.PORT || 4664;

httpApp.get('*', (req, res) => {
  res.redirect('https://' + req.headers.host + req.url);
});

app.get('/', (req, res) => {
  res.sendFile(makeAbsolute('index.htm'));
});

app.get('/favicon.png', (req, res) => {
    res.sendFile(makeAbsolute('images/icon.png'));
});

app.get('/public/*', (req, res) => {
  absolutePath = makeAbsolute(req.url);
  if (fs.existsSync(absolutePath))
  {
    res.sendFile(absolutePath);
  } else {
    res.sendStatus(404)
  }
});

app.get('/info/*', (req, res) =>
{
  var detail = req.url.substring(req.url.indexOf("/", 1)+1);
  if (detail == "rooms") {
    res.status(200).send(rooms);
  }
})

app.get('/newRoom/', (req, res) =>
{
  let r = newRoom();
  res.send({room: r});
});

var rooms = [];
var httpServer  = http.createServer(httpApp);
var httpsServer = https.createServer(credentials, app);
var io = socket.listen(httpsServer);

rooms = [];

httpServer.listen(8080);
httpsServer.listen(8443);

var numPlayers = 0;
var maxPlayers = 2;
var playerSocket = [];
var carPosition = [];
var acceptingPlayers = true;

newRoom = function() {
  var index = rooms.length;
  var roomId = XHash.hash64(new Buffer("rm_"+index.toString()),
                            0x008cc8,
                            'hex');
  rooms[index] = {index: index, players: 0, id: roomId};
  return rooms[index];
}

io.sockets.on('connection', function(socket) {
  if (numPlayers >= maxPlayers) return;
  var playerId = numPlayers++;
  playerSocket[playerId] = socket;

  console.log("Player number", numPlayers, "has joined!");
  socket.emit('playerId', playerId);

  socket.on('car_position_update', function(message) {
    carPosition[playerId] = message;
    //console.log(message);
    socket.broadcast.volatile.emit('car_position_update', carPosition);
  })

  if (numPlayers == maxPlayers)
  {
    acceptingPlayers = false;
    io.emit('game_status', {'ready': true, 'numPlayers': numPlayers});
  };
})

makeAbsolute = (relativePath) => {
  return path.join(__dirname, relativePath);
}

// establishConnection(mongo);
