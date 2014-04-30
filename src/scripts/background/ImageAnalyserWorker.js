var Analyser = function(data) {
	this._imgData = data.imgData;
	this._imgWidth = data.imgWidth;
	this._imgHeight = data.imgHeight;
	this._x = data.x;
	this._y = data.y;
	this._segmentWidth = data.segmentWidth;
	this._segmentHeight = data.segmentHeight;
};

Analyser.prototype.run = function() {
	var segment = this._calculateSegment();

	//return segment; // For debugging purposes

	return this._normaliseSegment(segment);
};

Analyser.prototype._calculateSegment = function() {
	var segment = {
		r: 0,
		g: 0,
		b: 0,
		a: 0
	};
	
	var segmentX = this._x * this._segmentWidth,
		segmentY = this._y * this._segmentHeight,
		flatSegmentY = segmentY * this._imgWidth;

	for(var offsetY = 0; offsetY < this._segmentHeight; offsetY++) {
		var flatOffsetY = offsetY * this._imgWidth;

		for(var offsetX = 0; offsetX < this._segmentWidth; offsetX++) {
			var pixelIndex = segmentX + offsetX + flatSegmentY + flatOffsetY,
				dataPoint = pixelIndex * 4;

			segment.r += this._imgData.data[dataPoint];
			segment.g += this._imgData.data[dataPoint + 1];
			segment.b += this._imgData.data[dataPoint + 2];
			segment.a += this._imgData.data[dataPoint + 3];
		}
	}

	//Average
	var size = this._segmentWidth * this._segmentHeight;

	segment.r = this._average(segment.r, size);
	segment.g = this._average(segment.g, size);
	segment.b = this._average(segment.b, size);
	segment.a = this._average(segment.a, size);

	return segment;
};

Analyser.prototype._average = function(color, size) {
	return (color / size) | 0; //Bitwise rounding down
};

Analyser.prototype._normaliseSegment = function(segment) {
	if(segment.r === segment.g && segment.r === segment.b) {
		segment.r = segment.g = segment.b = this._normaliseColour({
			color: segment.r, 
			precision: 85
		});
		
		return segment;
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
	segment[first] = this._normaliseColour({
		color: segment[first],
		precision: 85
	});
	segment[third] = this._normaliseColour({
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

	return segment;
};

Analyser.prototype._normaliseColour = function(opts) {
	var color = opts.color,
		precision = opts.precision,
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

	low = precision * ((color / precision) | 0);
	high = low + precision;

	if(color - low < high - color) {
		color = low;
	} else {
		color = high;
	}

	if(color > max) {
		color = max;
	} else if(color < 0) {
		color = 0;
	}

	return color | 0;
};

self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'run':
			var analyser = new Analyser({
				imgData: data.imgData,
				imgWidth: data.imgWidth,
				imgHeight: data.imgHeight,
				x: data.x,
				y: data.y,
				segmentWidth: data.segmentWidth,
				segmentHeight: data.segmentHeight
			});

			var segment = analyser.run();

			self.postMessage({
				id: 'segment',
				segment: segment,
				x: data.x,
				y: data.y
			});
			break;
		case 'end':
			self.close(); // Terminates the worker.
			break;
		default:
			self.postMessage('Unknown command: ' + data.msg);
	}
}, false);