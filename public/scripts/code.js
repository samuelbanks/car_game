// Define global variables
var isKeyPressed = Array();
var keyNames = Array();
var tickerHandle = 0;
var gridOffset = {x: 0, y: 0};
var gridTileSize = {w: 180, h: 180};
var gameFullSize;
var gameCentre;
var gameCanvas;
var mobile = false;
var cars = [];
var camera = {x: 0, y: 0, width: 1, height: 1, zoom: 1, rotation: 0};
var playerId = 0;
var socket;
var numPlayers = 0;
var firstTick;
var fps = 60;
var currentScreen = "";

var constants = {forwardAcc: 0.3*60/fps,
                 brakingDec: 0.2*60/fps,
                 decelFactor: Math.pow(0.98,60/fps),
                 brakingDecelFactor: Math.pow(0.94,60/fps),
                 maxSpeedResistance: Math.pow(0.99,60/fps),
                 turn: 0.03*60/fps,
                 speedLimit: 4*60/fps};

var images = [];   // using optional size for image

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

onWindowResizeFinish = function(callback)
{
  var rtime;
  var timeout = false;
  var delta = 200;
  $(window).resize(function() {
    rtime = new Date();
    if (timeout === false) {
      timeout = true;
      setTimeout(() => {resizeEnd(callback)}, delta);
    }
  });

  function resizeEnd(callback) {
    if (new Date() - rtime < delta) {
      setTimeout(() => {resizeEnd(callback)}, delta);
    } else {
      timeout = false;
      callback();
    }
  }
}

pauseGame = function()
{
  if (tickerHandle != 0)
  {
    clearInterval(tickerHandle);
    tickerHandle = 0;
    releaseKeys(isKeyPressed);
    showPausedMessage();
  }
}

showPausedMessage = function()
{
  var w = gameFullSize.w;
  var h = gameFullSize.h;
  var stripSize = 200;
  var ctx = gameCanvas.getContext("2d");

  ctx.fillStyle = "rgba(220, 220, 220, 0.8)";
  ctx.fillRect(0, (h-stripSize)/2-.5, w, stripSize+1);

  ctx.beginPath();
  ctx.moveTo(0, (h-stripSize)/2-.5);
  ctx.lineTo(gameFullSize.w, (h-stripSize)/2-.5);
  ctx.moveTo(0, (h+stripSize)/2+.5);
  ctx.lineTo(gameFullSize.w, (h+stripSize)/2+.5);
  ctx.strokeStyle = "#333";
  ctx.closePath();
  ctx.stroke();

  ctx.drawImage(images["paused"],
                (w - images["paused"].width)  / 2,
                (h - images["paused"].height) / 2);
}

startGame = function()
{
  if (tickerHandle == 0)
  {
    tickerHandle = setInterval(tick, 1000/fps);
  }
}

function pressKey(e)
{
	isKeyPressed[keyNames[e.keyCode]] = true;
}

function releaseKey(e)
{
	isKeyPressed[keyNames[e.keyCode]] = false;
}

function nameKeys()
{
	keyNames[37] = "LEFT";
	keyNames[38] = "UP";
	keyNames[39] = "RIGHT";
	keyNames[40] = "DOWN";
	keyNames[32] = "SPACE";
}

function releaseKeys(keySet)
{
	keySet["UP"   ] = false;
	keySet["DOWN" ] = false;
	keySet["LEFT" ] = false;
	keySet["RIGHT"] = false;
	keySet["SPACE"] = false;
  keySet["z"] = false;
}

resizeCanvas = function()
{
  console.log("resize");
  oldWidth = gameCanvas.width;
  oldHeight = gameCanvas.height;
  gameCanvas.width  = $(window).width()  - 20 * 2;
  gameCanvas.height = $(window).height() - 20 * 2;
  gameFullSize = {w: gameCanvas.width, h: gameCanvas.height};
  gameCentre = {x: gameFullSize.w / 2, y: gameFullSize.h / 2};
}

createServerConnection = function(pRoomId)
{
  var socket = io.connect();
  console.log(pRoomId);
  socket.emit('join_room', {roomId: pRoomId});
  socket.on('join_room', function(message) {
    if (message.success == true)
    {
      roomId = pRoomId;
      toggleMenu(false);
      toggleGame(true);
      initialiseGame(4);
    }
  });
  socket.on('playerId', function(message) {
    playerId = message;
    console.log("You are player", playerId);
  });
  /*socket.on('game_status', function(message) {
    console.log("game_status");
    console.log(message)
    if (message.ready == true) {
      initialiseGame(message.numPlayers);
    }
  })*/
  socket.on('car_position_update', function(message)
  {
    for (var i=0; i<numPlayers; i++)
    {
      if (i != playerId)
      {
        if (typeof(message[i]) != "undefined") {
          cars[i].pos = {x: message[i].pos.x, y: message[i].pos.y};
          cars[i].rotation = message[i].rotation;
        }
      }
    }
  })
  return socket;
}

newCar = function(colour)
{
  return {
    appearance: createCarAppearance(colour),
    pos: { x: 0, y: 0 },
    rotation: Math.PI/2,
    turn: constants.turn,
    xVel: 0,
    yVel: 0,
    accelerating: false,
    braking: false,
    backForce: false,
    speed: 0
  };
}

function initialiseGame(pNumPlayers)
{
  palette = ["#6D8AFF", "#56b07c", "#fe5f55", "#edc110"]
  firstTick = true;
  numPlayers = pNumPlayers;
  mobile = (typeof window.orientation !== "undefined");
  gameCanvasObj = $("#GameArea")
  gameCanvas = gameCanvasObj[0];
  resizeCanvas();
  camera.width = gameCanvas.width;
  camera.height = gameCanvas.height;
  loadImages(() => {
    gridOffset = {x: -gameCentre.x % gridTileSize.w - gridTileSize.w/2,
                  y: -gameCentre.y % gridTileSize.h - gridTileSize.h/2}
    console.log("init");
    cars[0] = newCar(palette[0]);
    cars[0].pos.x = -150;
    for (var i=1;i<numPlayers;i++)
    {
      cars[i] = newCar();
      cars[i].appearance = createCarAppearance(palette[i]);
      cars[i].pos.x = -150 + i * 100;
    }
    //$(window).blur(pauseGame);
    $(document).keydown((e) => {if (e.keyCode != 9) startGame();});
    $("body").keydown(pressKey);
    $("body").keyup(releaseKey);
  	nameKeys();
  	releaseKeys(isKeyPressed);
  	//makeHighRes(gameCanvas);
    startGame();
  });
}

function checkKeys()
{
	if (isKeyPressed["LEFT"])
	{
		cars[playerId].rotation += cars[playerId].turn;
	}
	if (isKeyPressed["RIGHT"])
	{
		cars[playerId].rotation -= cars[playerId].turn;
	}
	if (isKeyPressed["UP"])
	{
		cars[playerId].accelerating = true;
	}
	if (isKeyPressed["DOWN"])
	{
		cars[playerId].braking = true;
	}
  if (isKeyPressed["SPACE"])
  {
    cars[playerId].backForce = true;
  }
}

function getVector(length, angle)
{
	vec = {x:  length * Math.cos(angle),
         y: -length * Math.sin(angle)} ;
	return vec;
}

function withinBounds(value, range)
{
  return (value >= range.low && value <= range.high);
}

function moveObject(obj, bindRadius)
{
	var acc = 0;
	var brake = 0;
  var remainder = {x: 0, y: 0}
	if (obj.accelerating == true)
	{
		//obj.speed = obj.speed + 1/(obj.speed+1)-0.1
		acc = constants.forwardAcc;
	}
	if (obj.braking == true)
	{
		acc = -constants.brakingDec;
		decelFactor = constants.brakingDecelFactor;
	} else {
    decelFactor = constants.decelFactor;
  }
  if (obj.backForce == true)
  {
    console.log(obj.turn)
  }

	obj.speed += acc;
	obj.speed *= decelFactor;
	if (Math.abs(obj.speed) < 0.01) { obj.speed = 0; }
	if (obj.speed > constants.speedLimit) { obj.speed *= constants.maxSpeedResistance; }
	velocityVector = getVector(obj.speed, obj.rotation); // - Math.PI/2);
  newPos = {
    x: obj.pos.x + velocityVector.x,
    y: obj.pos.y + velocityVector.y
  };

  bindRadius = undefined;
  if (bindRadius == undefined)
  {
    obj.pos = newPos;
  }
  else
  {
    distFromCentreSq = Math.pow(newPos.x - gameCentre.x, 2) + Math.pow(newPos.y - gameCentre.y, 2);

    bindRadiusSq = bindRadius*bindRadius;
    adjFac = Math.pow((bindRadiusSq - distFromCentreSq) / bindRadiusSq, 0.2);
    if (distFromCentreSq == 0) adjFac = 1;

    remainder = {x: newPos.x, y: newPos.y};
    newPos.x = gameCentre.x + (newPos.x - gameCentre.x) * adjFac;
    newPos.y = gameCentre.y + (newPos.y - gameCentre.y) * adjFac;
    remainder.x = remainder.x - newPos.x;
    remainder.y = remainder.y - newPos.y;
    obj.pos = newPos;
  }

  return remainder;
}

dist = function(c1, c2)
{
  dx = c2.x-c1.x;
  dy = c2.y-c1.y;
  return Math.sqrt(dx*dx+dy*dy);
}

// follow = function()
// {
//   dx = cars[0].pos.x - cars[1].pos.x;
//   dy = cars[0].pos.y - cars[1].pos.y;
//   if (dx == 0) {
//     angle=-Math.PI/2
//     if (dy>0) angle*=-1;
//   } else {
//     angle = Math.atan(dy/dx);
//   }
//   if (dx > 0 && dy > 0) angle *= -1
//   if (dx > 0 && dy < 0) angle *= -1
//   if (dx < 0 && dy > 0) angle = -Math.PI-angle;
//   if (dx < 0 && dy < 0) angle = Math.PI-angle;
//   rotTurn = (angle - cars[1].rotation);
//   if (rotTurn < -Math.PI) rotTurn += 2*Math.PI;
//   if (rotTurn >  Math.PI) rotTurn -= 2*Math.PI;
//   limitedTurn = Math.min(cars[1].turn, Math.max(-cars[1].turn, rotTurn))
//   if (Math.abs(rotTurn) < Math.PI/8) cars[1].accelerating = true;
//   if (dist(cars[0].pos, cars[1].pos) < 100 && cars[0].accelerating == false) cars[1].accelerating = false;
//   moveObject(cars[1]);
//   cars[1].rotation += limitedTurn;
//   desiredRot = dx
// }

function tick()
{
	cars[playerId].accelerating = false;
	cars[playerId].braking = false;
  cars[playerId].backForce = false;
  //if (mobile) cars[playerId].accelerating = true;
	checkKeys();
  //follow();
  var radius = 223;
  var lastCarPos = {x: cars[playerId].pos.x, y: cars[playerId].pos.y};
	var remainder = moveObject(cars[playerId], radius);
  var carHasMoved = cars[playerId].pos.x != lastCarPos.x |
                    cars[playerId].pos.y != lastCarPos.y;
  if (firstTick | carHasMoved)
  {
    socket.emit('car_position_update', {roomId: roomId,
                                        pos: cars[playerId].pos,
                                        rotation: cars[playerId].rotation});
  }

  adjustCamera(camera, cars);
  gridOffset.x += remainder.x;
  gridOffset.y += remainder.y;
  gridOffset.x = gridOffset.x % gridTileSize.w;
  gridOffset.y = gridOffset.y % gridTileSize.h;

	clearCanvas(gameCanvas);
  drawGrid(gameCanvas, gridOffset, camera);
  for(var carId in cars)
  {
    drawObject(gameCanvas, cars[carId], camera);
  }
  firstTick = false;
}

function clearCanvas(ctx)
{
	var context = ctx.getContext("2d");
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function makeHighRes(c)
{
	var ctx = c.getContext('2d');
	// finally query the various pixel ratios
	var devicePixelRatio = window.devicePixelRatio || 1;
	var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
		ctx.mozBackingStorePixelRatio ||
		ctx.msBackingStorePixelRatio  ||
		ctx.oBackingStorePixelRatio   ||
		ctx.backingStorePixelRatio    || 1;
	var ratio = devicePixelRatio / backingStoreRatio;
	// upscale canvas if the two ratios don't match
	if (devicePixelRatio !== backingStoreRatio) {
		var oldWidth  = c.clientWidth;
		var oldHeight = c.clientHeight;
		c.width  = Math.round(oldWidth  * ratio);
		c.height = Math.round(oldHeight * ratio);
		c.style.width  = oldWidth  + 'px';
		c.style.height = oldHeight + 'px';
		// now scale the context to counter
		// the fact that we've manually scaled
		// our canvas element
		ctx.scale(ratio/2, ratio/2);
	}
}

loadDependencies = function(onComplete)
{
  dependencies = ["scripts/images",
                  "scripts/mechanics",
                  "scripts/drawing",
                  "scripts/shapes",
                  "scripts/utils"];
  console.log("Loading scripts...");
  requirejs(dependencies,
    () => {
      console.log("...scripts loaded");
      onComplete();
    });
}

requestNewRoom = function() {
  $.ajax({
    method: "GET",
    url: "/newroom"
  }).done(function(roomInfo) {
    //createRoomButtons(roomInfo);
    socket = createServerConnection(roomInfo.room.id);
  });
};

joinRoom = function(roomId) {
  $.ajax({
    method: "GET",
    url: "/joinroom/" + roomId
  }).done(function(roomInfo) {
    console.log(roomInfo);
    if (roomInfo.auth == true)
    {
      socket = createServerConnection(roomId);
    }
  });
}

queryRoomId = function() {
  $("#backdrop").show();
}

initialiseLobby = function() {
  /*$.ajax({
    method: "GET",
    url: "/info/rooms"
  }).done(function(roomInfo) {
    //createRoomButtons(roomInfo.rooms);*/
    $("#newroom").click(requestNewRoom);
    $("#joinroom").click(queryRoomId);
    $("#roomQueryOk").click(() => {
      var roomId = $("#roomQueryInput").val();
      joinRoom(roomId);
    });
    $("#roomQueryCancel").click(() => {$("#backdrop").hide()})
    $("#GameArea").mousedown(() => {copyToClipboard(roomId)});
  //});
};

toggleMenu = function(show) {
  if (show) {
    $("#centre").show();
  } else {
    $("#centre").hide();
    $("#backdrop").hide();
  }
}
toggleGame = function(show) {
  if (show) {
    $("#GameArea").show();
  } else {
    $("#GameArea").hide();
  }
}

$(document).ready(() => {
  loadDependencies(() => {
    initialiseLobby();
  });
});
