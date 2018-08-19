function createCarAppearance()
{
  randomColour = [Math.round(Math.random()*255),
                  Math.round(Math.random()*255),
                  Math.round(Math.random()*255)];
  randomColour = "rgba(" +
                  randomColour[0] + "," +
                  randomColour[1] + "," +
                  randomColour[2] + ",1)";
  randomColour = "rgba(0, 0, 255, 1)";
  console.log(randomColour);
	var elements = [];
	elements.push({
		type: "fill",
		pos: {x: -9, y: -4},
    size: {x: 17, y: 26},
		color: randomColour, // "#0000ff",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x: -10, y: - 5 },
			{ x:   9, y: - 5 },
			{ x:   9, y:  23 },
			{ x: -10, y:  23 },
			{ x: -10, y: - 5 }
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x: - 9, y: - 4 },
			{ x:   8, y: - 4 },
			{ x:   8, y:  22 },
			{ x: - 9, y:  22 },
			{ x: - 9, y: - 4 }
		],
		color: "#fff",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x: -11, y: - 3 },
			{ x: -11, y:   4 },
			{ x: -12, y:   4 },
			{ x: -12, y: - 3 },
			{ x: -11, y: - 3 },
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	elements.push({
		type: "path",
		points: [
			{ x:  10, y: - 3 },
			{ x:  10, y:   4 },
			{ x:  11, y:   4 },
			{ x:  11, y: - 3 },
			{ x:  10, y: - 3 }
		],
		color: "#000",
		width: 1,
		alpha: 1
	});
	return elements;
}
