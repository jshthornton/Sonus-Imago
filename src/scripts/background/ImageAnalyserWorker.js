self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'doSegment':
			self.postMessage('WORKER STARTED');
			var segment = calcSegment(data.imgData, data.imgWidth, data.imgHeight, data.x, data.y, data.segmentWidth, data.segmentHeight);
			self.postMessage({
				id: 'segment',
				segment: segment
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


	//Normalise
	var size = segmentWidth * segmentHeight;
	segment.r = parseInt(segment.r / size, 10);
	segment.g = parseInt(segment.g / size, 10);
	segment.b = parseInt(segment.b / size, 10);
	segment.a = parseInt(segment.a / size, 10);

	//console.dir(segment);

	//segments.push(segment);

	console.log('done');

	return segment;
}