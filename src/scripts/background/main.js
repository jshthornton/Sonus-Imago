(function(undefined) {
	'use strict';

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var numCols = 5,
			numRows = 5;

		function getMoodType() {
			return 0;
		}

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

		function getImageData(src, resp) {
			var img = new Image();
			img.onload = function() {
				var canvas = document.createElement('canvas'),
					ctx = canvas.getContext('2d'),
					imgWidth = img.width,
					imgHeight = img.height,
					excessWidth = imgWidth % numCols,
					excessHeight = imgHeight % numRows,
					offsetX = Math.floor(excessWidth / 2),
					offsetY = Math.floor(excessHeight / 2),
					fauxWidth = imgWidth - excessWidth,
					fauxHeight = imgHeight - excessHeight;


				ctx.drawImage(img, 0, 0);

				var imgData = ctx.getImageData(offsetX, offsetY, fauxWidth, fauxHeight);

				console.groupCollapsed('Image Information');

				console.groupCollapsed('Raw');
				console.log('Width: %i', imgWidth);
				console.log('Height: %i', imgHeight);
				console.groupEnd();

				console.groupCollapsed('Excess');
				console.log('Width: %i', excessWidth);
				console.log('Height: %i', excessHeight);
				console.groupEnd();

				console.groupCollapsed('Offset');
				console.log('X: %i', offsetX);
				console.log('Y: %i', offsetY);
				console.groupEnd();

				console.groupCollapsed('Faux');
				console.log('Width: %i', fauxWidth);
				console.log('Height: %i', fauxHeight);
				console.groupEnd();

				console.groupEnd();

				canvas = null;

				resp.resolve({
					width: imgData.width,
					height: imgData.height,
					segments: getSegments(imgData)
				});
			};
			img.src = src;
		}

		require([
			'jquery'
		], function($) {
			var responseDef = new $.Deferred();

			responseDef.then(function() {
				sendResponse(Array.prototype.slice.call(arguments, 0));
				console.groupEnd(); //Message
			});

			console.groupCollapsed('Message');
			
			switch(request.type) {
				case 'getImageData':
					console.log('Request: %O', request);
					getImageData(request.imageSrc, responseDef);
					break;
			}
		});

		return true;
	});

}());