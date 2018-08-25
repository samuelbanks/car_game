adjustCamera = function(camera, objectsToFit)
{
  var left   = objectsToFit[0].pos.x - 50;
  var top    = objectsToFit[0].pos.y - 50;
  var right  = objectsToFit[0].pos.x + 50;
  var bottom = objectsToFit[0].pos.y + 50;
  remainingObjs = objectsToFit.slice(1);
  for (objId in remainingObjs)
  {
    left   = Math.min(left,   remainingObjs[objId].pos.x - 50);
    top    = Math.min(top,    remainingObjs[objId].pos.y - 50);
    right  = Math.max(right,  remainingObjs[objId].pos.x + 50);
    bottom = Math.max(bottom, remainingObjs[objId].pos.y + 50);
  }
  camera.x = (right+left)/2;
  camera.y = (bottom+top)/2;
  camera.zoom = Math.min(1,
                         Math.min(camera.width/(right-left),
                                  camera.height/(bottom-top)));
}

function rotate(coords, angle)
{
	return ({
		x: coords.x * Math.cos(angle) - coords.y * Math.sin(angle),
		y: coords.x * Math.sin(angle) + coords.y * Math.cos(angle)
	})
}

shift = function(coords, amount)
{
  return ({
    x: coords.x + amount.x,
    y: coords.y + amount.y
  });
}

scale = function(coords, factor)
{
  return({
    x: coords.x * factor,
    y: coords.y * factor
  });
}

function center(coords, centerPoint)
{
	return ({
		x: coords.x + centerPoint.x,
		y: coords.y + centerPoint.y
	})
}

function drawGrid(canvas, offset, camera)
{
	context = canvas.getContext("2d");

  context.translate(camera.width/2, camera.height/2);
  context.scale(camera.zoom, camera.zoom);
  context.translate(-camera.x, -camera.y);
  context.rotate(-camera.rotation);

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = "#444";
  leftStart = -Math.floor(canvas.width/camera.zoom/gridTileSize.w)*gridTileSize.w;
  topStart  = -Math.floor(canvas.height/camera.zoom/gridTileSize.h)*gridTileSize.h;
  //for (var x = -offset.x; x <= canvas.width; x += gridTileSize.w)
  for (var x = 0; x <= canvas.width/camera.zoom; x += gridTileSize.w)
  {
    //for (var y = -offset.y; y <= canvas.height; y += gridTileSize.h)
    for (var y = 0; y <= canvas.height/camera.zoom; y += gridTileSize.h)
    {
      //context.moveTo(x*camera.zoom-.5, y*camera.zoom-3);
      //context.lineTo(x*camera.zoom-.5, y*camera.zoom+2);
      //context.moveTo(x*camera.zoom-3,  y*camera.zoom-.5);
      //context.lineTo(x*camera.zoom+2,  y*camera.zoom-.5);
      context.moveTo( x-.5,  y-3);  context.lineTo( x-.5,  y+ 2);
      context.moveTo( x- 3,  y-.5); context.lineTo( x+ 2,  y-.5);
      context.moveTo(-x+.5,  y-3);  context.lineTo(-x+.5,  y+ 2);
      context.moveTo(-x+ 3,  y-.5); context.lineTo(-x- 2,  y-.5);
      context.moveTo( x-.5, -y+3);  context.lineTo( x-.5, -y- 2);
      context.moveTo( x- 3, -y+.5); context.lineTo( x+ 2, -y+.5);
      context.moveTo(-x+.5, -y+3);  context.lineTo(-x+.5, -y- 2);
      context.moveTo(-x+ 3, -y+.5); context.lineTo(-x- 2, -y+.5);
    }
  }
  context.closePath();
  context.stroke();

  context.rotate(camera.rotation);
  context.translate(camera.x, camera.y);
  context.scale(1/camera.zoom, 1/camera.zoom);
  context.translate(-camera.width/2, -camera.height/2);

}

function drawObject(canvas, object, camera)
{
	context = canvas.getContext("2d");

  context.translate(camera.width/2, camera.height/2);
  context.scale(camera.zoom, camera.zoom);
  context.translate(object.pos.x - camera.x, object.pos.y - camera.y);
  context.rotate(-object.rotation - camera.rotation);

	object.appearance.forEach(function (shapeDef)
	{
		if (shapeDef.type == "path")
		{
			context.beginPath();
			context.lineWidth = shapeDef.width;
			context.strokeStyle = shapeDef.color;
			context.moveTo(shapeDef.points[0].x, shapeDef.points[0].y);
			shapeDef.points.forEach(function (point)
			{
				context.lineTo(point.x, point.y);
			});
			context.closePath();
			context.stroke();
		}
		else if (shapeDef.type == "fill")
		{
      context.fillStyle = shapeDef.color;
			context.fillRect(shapeDef.pos.x,
                       shapeDef.pos.y,
                       shapeDef.size.x,
                       shapeDef.size.y);
		}
	});

  context.rotate(object.rotation + camera.rotation);
  context.translate(-object.pos.x + camera.x, -object.pos.y + camera.y);
  context.scale(1/camera.zoom, 1/camera.zoom);
  context.translate(-camera.width/2, -camera.height/2);

}
