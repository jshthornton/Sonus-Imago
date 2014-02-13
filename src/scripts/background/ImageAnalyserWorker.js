self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'doSegment':
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

	var precision = parseInt((imgWidth * imgHeight) / 10000, 10),
		segmentX = x * segmentWidth,
		segmentY = y * segmentHeight,
		flatSegmentY = segmentY * imgWidth;

	if(precision < 1) {
		precision = 1;
	}

	precision = 1;

	for(var offsetY = 0; offsetY < segmentHeight; offsetY += precision) {
		var flatOffsetY = offsetY * imgWidth;

		for(var offsetX = 0; offsetX < segmentWidth; offsetX += precision) {
			var pixelIndex = segmentX + offsetX + flatSegmentY + flatOffsetY,
				dataPoint = pixelIndex * 4;

			segment.r += imgData.data[dataPoint];
			segment.g += imgData.data[dataPoint + 1];
			segment.b += imgData.data[dataPoint + 2];
			segment.a += imgData.data[dataPoint + 3];
		}
	}


	//Average
	var size = segmentWidth * segmentHeight;

	function average(color, size) {
		return parseInt(color / size, 10);
	}

	segment.r = average(segment.r, size);
	segment.g = average(segment.g, size);
	segment.b = average(segment.b, size);
	segment.a = average(segment.a, size);

	//return segment;

	function normalise(opts) {
		var color = opts.color,
			precision = opts.precision,
			direction = opts.direction,
			low,
			high,
			benchmark = opts.benchmark || color,
			max = 255;

		if(!precision) {
			if(benchmark === 0) {
				max = 0;
			} else if(benchmark <= 85) {
				precision = 85/3;
				max = 85;
			} else if(benchmark <= 170) {
				precision = 170/3;
				max = 170;
			} else if(benchmark <= 255) {
				precision = 255/3;
				max = 255;
			} 
		}

		if(max === 0) return 0;

		low = precision * parseInt(color / precision, 10);
		high = low + precision;

		if(direction) {
			if(direction === 'up') {
				color = high;
			} else if(direction === 'down') {
				color = low;
			}
		} else {
			if(color - low < high - color) {
				color = low;
			} else {
				color = high;
			}
		}

		if(color > max) {
			color = max;
		} else if(color < 0) {
			color = 0;
		}

		return parseInt(color, 10);
	}

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

	var firstDiff = segment[first] - segment[second],
		thirdDiff = segment[second] - segment[third];

	//Normalise primary and third
	segment[first] = normalise({
		color: segment[first],
		precision: 85//,
		//direction: (segment[first] > 85) ? 'up' : undefined
	});
	segment[third] = normalise({
		color: segment[third], 
		benchmark: segment[first],
		precision: (segment[first] === 28 || segment[first] === 0) ? 85 : undefined
	});

	//Find the second highest, is it closer to the first or the third
	if(firstDiff < thirdDiff) {
		segment[second] = segment[first];
	} else {
		segment[second] = segment[third];
	}

	if(segment[first] === segment[second] && segment[first] === segment[third]) {
		segment[third] = segment[second] = segment[first] = normalise({
			color: segment[first], 
			precision: 85
		});
	}

	return segment;
}