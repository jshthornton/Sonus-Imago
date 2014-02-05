self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'doSegment':
			self.postMessage('WORKER STARTED');
			var segment = calcSegment(data.imgData, data.imgWidth, data.imgHeight, data.x, data.y, data.segmentWidth, data.segmentHeight);
			self.postMessage({
				id: 'segment',
				segment: segment,
				x: data.x,
				y: data.y,
				normalise: data.normalise
			});
			self.close();
			break;
		case 'stop':
			self.close(); // Terminates the worker.
			break;
		default:
			self.postMessage('Unknown command: ' + data.msg);
	};
}, false);

function calcSegment(imgData, imgWidth, imgHeight, x, y, segmentWidth, segmentHeight) {
	var segment = {
		r: 0,
		g: 0,
		b: 0,
		a: 0
	};

	//segments.push(segment);

	var precision = parseInt((imgWidth * imgHeight) / 10000, 10),
		segmentX = x * segmentWidth,
		segmentY = y * segmentHeight,
		flatSegmentY = segmentY * imgWidth;

	if(precision < 1) {
		precision = 1;
	}

	precision = 1;

	//console.log('sX: ' + segmentX + ', sY: ' + segmentY + ', fsY: ' + flatSegmentY);


	for(var offsetY = 0; offsetY < segmentHeight; offsetY += precision) {
		var flatOffsetY = offsetY * imgWidth;

		for(var offsetX = 0; offsetX < segmentWidth; offsetX += precision) {
			var pixelIndex = segmentX + offsetX + flatSegmentY + flatOffsetY,
				dataPoint = pixelIndex * 4;
			
			//console.log('oY: ' + offsetY + ', oX: ' + offsetX + ', foY: ' + flatOffsetY + ', pI: ' + pixelIndex + ', dP: ' + dataPoint);

			segment.r += imgData.data[dataPoint];
			segment.g += imgData.data[dataPoint + 1];
			segment.b += imgData.data[dataPoint + 2];
			segment.a += imgData.data[dataPoint + 3];
		}
	}


	//Average
	var size = segmentWidth * segmentHeight;
	segment.r = parseInt(segment.r / size, 10);
	segment.g = parseInt(segment.g / size, 10);
	segment.b = parseInt(segment.b / size, 10);
	segment.a = parseInt(segment.a / size, 10);

/*	function normalise(a, b, c) {
		if(a > b && a > c) {
			return _normalise(a, true);
		}

		return _normalise(a, false);
	}

	function _normalise(colour, primary) {
		var remainder = colour % 85;

		//colour = 85 * parseInt(colour / 85, 10);

		if(primary) {
			//colour += 85;
			colour = 255;
		} else if(colour > 127) {
			colour = 255;
		} else {
			colour = 0;
		}

		return colour;
	}*/

	function normalise(color, direction) {
		var remainder = color % 85;

		color = 85 * parseInt(color / 85, 10);

		if(direction === 'closest') {
			if(remainder > 42) {
				color += 85;
			}
		}

		if(direction === 'up') {
			color += 85;
		}

		return color;
	}

	//segment.r = normalise(segment.r, segment.g, segment.b);
	//segment.g = normalise(segment.g, segment.r, segment.b);
	//segment.b = normalise(segment.b, segment.g, segment.r);

	//return segment;


	//Check if all three are equal (white, grey, black)
	//Normalise all
	if(isEqualRange(segment.r, segment.g, 20) && isEqualRange(segment.r, segment.b, 20)) {
		if((segment.r >= 42 && segment.r <= 85) || (segment.r >= 213 && segment.r <= 255)) {
			segment.r = normalise(segment.r, 'up');
			segment.g = normalise(segment.g, 'up');
			segment.b = normalise(segment.b, 'up');
		} else {
			segment.r = normalise(segment.r, 'down');
			segment.g = normalise(segment.g, 'down');
			segment.b = normalise(segment.b, 'down');
		}
	} else {
		//Check for the primary colour
		var first,
			second,
			third;

		if(segment.r >= segment.g && segment.r >= segment.b) {
			//Red
			first = 'r';
			if(segment.g > segment.b) {
				second = 'g';
				third = 'b';
			} else {
				second = 'b';
				third = 'g';
			}
		} else if(segment.g >= segment.b && segment.g >= segment.r) {
			//Green
			first = 'g';
			if(segment.r > segment.b) {
				second = 'r';
				third = 'b';
			} else {
				second = 'b';
				third = 'r';
			}
		} else if(segment.b >= segment.r && segment.b >= segment.g) {
			//Blue
			first = 'b';
			if(segment.r > segment.g) {
				second = 'r';
				third = 'g';
			} else {
				second = 'g';
				third = 'r';
			}
		}

		//if(segment[second]) is closer to a normalised point, then making it the normalised one rather than following the first or third
		if(segment[second] % 85 < segment[first] - segment[second]) {
			segment[second] = normalise(segment[second], 'closest');
		} else {
			//Find the second highest, is it closer to the first or the third
			if(segment[first] - segment[second] < segment[second] - segment[third]) {
				//Closest to first -> match it to first
				segment[second] = normalise(segment[second], 'up');
			} else {
				//Closest to lowest -> decrease to 85, 170, 255
				segment[second] = normalise(segment[second], 'down');
			}
		}

		
		//then increase primary to 85, 170, 255
		segment[first] = normalise(segment[first], 'up');

		//Decrease lowest to 85, 170, 255
		segment[third] = normalise(segment[third], 'down');
	}

	//console.dir(segment);

	//segments.push(segment);

	return segment;
}

function isEqualRange(a, b, range) {
	return (a >= b - range && a <= b + range);
}