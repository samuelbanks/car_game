function createCarAppearance(colour)
{
  // randomColour = [Math.round(Math.random()*255),
  //                 Math.round(Math.random()*255),
  //                 Math.round(Math.random()*255)];
  // randomColour = "rgba(" +
  //                 randomColour[0] + "," +
  //                 randomColour[1] + "," +
  //                 randomColour[2] + ",1)";
  // randomColour = "rgba(0, 0, 255, 1)";
  // console.log(randomColour);
	var elements = [];
	elements.push({
		type: "fill",
		pos:  {x:   4, y: - 9},
    size: {x: -26, y:  17},
		color: colour, // "#0000ff",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x:   5, y: -10 },
			{ x:   5, y:   9 },
			{ x: -23, y:   9 },
			{ x: -23, y: -10 },
			{ x:   5, y: -10 }
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x:   4, y: -9 },
			{ x:   4, y:  8 },
			{ x: -22, y:  8 },
			{ x: -22, y: -9 },
			{ x:   4, y: -9 }
		],
		color: "#fff",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x:  3, y: -11 },
			{ x: -4, y: -11 },
			{ x: -4, y: -12 },
			{ x:  3, y: -12 },
			{ x:  3, y: -11 },
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x:  3, y: 10 },
			{ x: -4, y: 10 },
			{ x: -4, y: 11 },
			{ x:  3, y: 11 },
			{ x:  3, y: 10 }
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	return elements;
}
