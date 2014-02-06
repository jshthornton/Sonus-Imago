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

	function average(color, size) {
		return parseInt(color / size, 10);
	}

	segment.r = average(segment.r, size);
	segment.g = average(segment.g, size);
	segment.b = average(segment.b, size);
	segment.a = average(segment.a, size);

	//return segment;

	function normalise(color, direction) {
		var precision,
			low,
			high;

		if(color >= 170) {
			precision = 255/3;
		} else if(color >= 85) {
			precision = 255/6;
		} else {
			precision = 255/12;
		}

		low = precision * parseInt(color / precision, 10);
		high = low + precision;

		if(color - low < high - color) {
			color = low;
		} else {
			color = high;
		}

		return parseInt(color, 10);
	}

	//segment.r = normalise(segment.r);
	//segment.g = normalise(segment.g);
	//segment.b = normalise(segment.b);

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
	segment[first] = normalise(segment[first]);
	segment[third] = normalise(segment[third]);

	//Find the second highest, is it closer to the first or the third
	if(firstDiff < thirdDiff) {
		//Closest to first -> match it to first
		segment[second] = segment[first];
	} else {
		//Closest to lowest -> decrease to 85, 170, 255
		segment[second] = segment[third];
	}

	return segment;
}

function isEqualRange(a, b, range) {
	return (a >= b - range && a <= b + range);
}