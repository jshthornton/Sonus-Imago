(function(undefined) {
	'use strict';





	chrome.runtime.onInstalled.addListener(function(){
		require([
			'jquery',
			'underscore',
			'collections/options'
		], function($, _, options) {
			options.localStorage._clear(); //@TODO: remove, dev only code.

			if(options.length === 0) {
				//Initial Setup
				options.resetInitial();
				options.saveAll();
			}
		});
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var numCols = 5,
			numRows = 5;

		function getSegments(imgData) {
			var imgWidth = imgData.width,
				imgHeight = imgData.height,
				segmentWidth = imgWidth / numCols,
				segmentHeight = imgHeight / numRows;

			console.groupCollapsed('Image Data (Canvas Export)');
			console.log('Width: %i', imgWidth);
			console.log('Height: %i', imgHeight);
			console.log('Data length: %i', imgData.data.length);
			console.log('Data: %O', imgData.data);
			console.groupEnd();

			console.groupCollapsed('Segment');
			console.log('Width: %i', segmentWidth);
			console.log('Height: %i', segmentHeight);
			
			var segments = [];

			for(var y = 0; y < numRows; y++) {
				console.group('y: %i', y);

				for(var x = 0; x < numCols; x++) {
					console.group('x: %i', x);

					var segment = {
						r: 0,
						g: 0,
						b: 0,
						a: 0
					};

					//segments.push(segment);

					var segmentX = x * segmentWidth,
						segmentY = y * segmentHeight,
						flatSegmentY = segmentY * imgWidth;

					console.log('sX: %d, sY: %d, fsY: %d', segmentX, segmentY, flatSegmentY);

					for(var offsetY = 0; offsetY < segmentHeight; offsetY++) {
						var flatOffsetY = offsetY * imgWidth;

						for(var offsetX = 0; offsetX < segmentWidth; offsetX++) {
							var pixelIndex = segmentX + offsetX + flatSegmentY + flatOffsetY,
								dataPoint = pixelIndex * 4;
							
							console.log('oY: %d, oX: %d, foY: %d, pI: %d, dP: %d', offsetY, offsetX, flatOffsetY, pixelIndex, dataPoint);

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

					console.log(segment);



					segments.push(segment);

					console.groupEnd();
				} //column

				console.groupEnd();
			} // row

			//console.log(segments);
			
			console.groupEnd();

			//console.log(data);

			return segments;
		}

		require([
			'jquery',
			'background/ImageAnalyser',
			'collections/options'
		], function($, ImageAnalyser, options) {
			options.fetch();

			var responseDef = new $.Deferred();

			responseDef.then(function() {
				sendResponse(Array.prototype.slice.call(arguments, 0));
				console.groupEnd(); //Message
			});

			console.groupCollapsed('Message');
			
			switch(request.type) {
				case 'getImageData':
					var imageAnalyser = new ImageAnalyser(request.imageSrc);

					//console.log('Request: %O', request);
					//getImageData(request.imageSrc, responseDef);
					break;
			}
		});

		return true;
	});

}());