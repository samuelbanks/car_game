function rotate(coords, angle)
{
	return ({
		x: coords.x * Math.cos(angle) - coords.y * Math.sin(angle),
		y: coords.x * Math.sin(angle) + coords.y * Math.cos(angle)
	})
}

function center(coords, centerPoint)
{
	return ({
		x: coords.x + centerPoint.x,
		y: coords.y + centerPoint.y
	})
}

function drawGrid(canvas, offset)
{
	context = canvas.getContext("2d");
  /*context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = "#aaa";
  for (var x = -offset.x; x <= canvas.width+offset.x; x += gridTileSize.w)
  {
    context.moveTo(x-.5, 0);
    context.lineTo(x-.5, canvas.height);
  }
  for (var y = -offset.y; y <= canvas.height+offset.y; y += gridTileSize.h)
  {
    context.moveTo(0, y-.5);
    context.lineTo(canvas.width, y-.5);
  }
  context.closePath();
  context.stroke();*/
  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = "#444";
  for (var x = -offset.x; x <= canvas.width; x += gridTileSize.w)
  {
    for (var y = -offset.y; y <= canvas.height; y += gridTileSize.h)
    {
      context.moveTo(x-.5, y-3);
      context.lineTo(x-.5, y+2);
      context.moveTo(x-3, y-.5);
      context.lineTo(x+2, y-.5);
    }
  }
  context.closePath();
  context.stroke();

}

function drawObject(canvas, object)
{
	context = canvas.getContext("2d");

	context.translate(object.pos.x, object.pos.y);
	context.rotate(object.rotation);

	object.appearance.forEach(function (shapeDef)
	{
		if (shapeDef.type == "path")
		{
			context.beginPath();
			context.lineWidth = shapeDef.width;
			context.strokeStyle = shapeDef.color;
			pointR = shapeDef.points[0];
			context.moveTo(pointR.x + .5, pointR.y + .5);
			shapeDef.points.forEach(function (point)
			{
				/*pointR = center(
							rotate(point, object.rotation),
							object.pos
						 );*/
				pointR = point;
				context.lineTo(pointR.x + .5, pointR.y + .5);
			});
			context.closePath();
			context.stroke();
		}
		else if (shapeDef.type == "fill")
		{
      context.fillStyle = shapeDef.color;
			context.fillRect(shapeDef.pos.x,  shapeDef.pos.y,
                       shapeDef.size.x, shapeDef.size.y);
		}
	});

	context.rotate(-object.rotation);
	context.translate(-object.pos.x, -object.pos.y);

}
