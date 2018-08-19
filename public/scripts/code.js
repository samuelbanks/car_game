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

var images = [];   // using optional size for image

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
    var fps = 60;
    tickerHandle = setInterval(tick, 1000/fps);
  }
}

copyObject = function(obj)
{
  var newObj = {};
  for (var elemId in obj)
  {
    if (typeof(obj[elemId]) == "object")
    {
      newObj[elemId] = copyObject(obj[elemId]);
    }
    else
    {
      newObj[elemId] = obj[elemId];
    }
  }
  return newObj;
}

var car;
// ---

// function $(handle)
// {
// 	if (handle.substring(0, 1) == "#")
// 	{
// 		return document.getElementById(handle.substring(1));
// 	}
// }

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
  gridOffset.x += ((gameCanvas.width - oldWidth) % gridTileSize.w) / 2;
  gridOffset.y += ((gameCanvas.height - oldHeight) % gridTileSize.h) / 2;
}

function initialise()
{
  onWindowResizeFinish(resizeCanvas);
  mobile = (typeof window.orientation !== "undefined");
  gameCanvasObj = $("#GameArea")
  gameCanvas = gameCanvasObj[0];
  resizeCanvas();
  loadImages(() =>
    {
      gridOffset = {x: -gameCentre.x % gridTileSize.w - gridTileSize.w/2,
                    y: -gameCentre.y % gridTileSize.h - gridTileSize.h/2}
      console.log("init");
      car = {
        appearance: createCarAppearance(),
        pos: { x: gameCentre.x, y: gameCentre.y},
        rotation: 0,
        turn: 0.03,
        xVel: 0,
        yVel: 0,
        accelerating: false,
        braking: false,
        backForce: false,
        speed: 0
      };
      $(window).blur(pauseGame);
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
		car.rotation -= car.turn;
	}
	if (isKeyPressed["RIGHT"])
	{
		car.rotation += car.turn;
	}
	if (isKeyPressed["UP"])
	{
		car.accelerating = true;
	}
	if (isKeyPressed["DOWN"])
	{
		car.braking = true;
	}
  if (isKeyPressed["SPACE"])
  {
    car.backForce = true;
  }
}

function getVector(length, angle)
{
	vec = {x: length * Math.cos(angle),
         y: length * Math.sin(angle)} ;
	return vec;
}

function withinBounds(value, range)
{
  return (value >= range.low && value <= range.high);
}

function moveObject(obj, bindRadius)
{
	acc = 0;
	brake = 0;
  remainder = {x: 0, y: 0}
	if (obj.accelerating == true)
	{
		//obj.speed = obj.speed + 1/(obj.speed+1)-0.1
		acc = 0.3;
	}
	if (obj.braking == true)
	{
		acc = -0.2;
		brake = -0.04;
	}
  if (obj.backForce == true)
  {
    console.log(obj.turn)
  }

	obj.speed += acc;
	obj.speed *= (0.98 + brake);
	if (Math.abs(obj.speed) < 0.01) { obj.speed = 0; }
	if (obj.speed > 4) { obj.speed *= 0.99; }
	velocityVector = getVector(obj.speed, obj.rotation - Math.PI/2);
  newPos = {
    x: obj.pos.x + velocityVector.x,
    y: obj.pos.y + velocityVector.y
  };

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

function tick()
{
	car.accelerating = false;
  if (mobile) car.accelerating = true;
	car.braking = false;
  car.backForce = false;
	checkKeys();
	rem = moveObject(car, 223);
  gridOffset.x += rem.x;
  gridOffset.y += rem.y;
  gridOffset.x = gridOffset.x % gridTileSize.w;
  gridOffset.y = gridOffset.y % gridTileSize.h;
	clearCanvas(gameCanvas);
  drawGrid(gameCanvas, gridOffset);
	drawObject(gameCanvas, car);
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
                  "scripts/shapes"];
  console.log("Loading scripts...");
  requirejs(dependencies,
    () => {
      console.log("...scripts loaded");
      onComplete();
    });
}

$(document).ready(() => {loadDependencies(initialise)});
