define([
	'require',
	'Class',
	'underscore',
	'collections/options'
], function(require, Class, _, options) {
	var numCols = 5,
		numRows = 5;


	var Cls = Class.extend({
		//_imgSrc
		//segments
		//trueLength
		//_def

		init: function(imgSrc) {
			_.bindAll(this);

			this._imgSrc = imgSrc;
			this.segments = [];
			this.trueLength = 0;
			this._def = new $.Deferred();
		},

		analyse: function(imgSrc) {
			this._loadImage(imgSrc);

			return this._def.promise();
		},

		_loadImage: function(imgSrc) {
			this._imgSrc = this._imgSrc || imgSrc;
			if(typeof this._imgSrc !== 'string') throw new Error('Unable to load image. No image source provided.');

			var img = new Image();
			img.addEventListener('load', this._onImageLoad, false);
			img.addEventListener('error', this._onImageError, false);
			img.src = this._imgSrc;

			console.log('Loading Image: %s', this._imgSrc);

			img = null;
		},

		_onImageLoad: function(e) {
			console.log('Image Loaded');

			var img = e.currentTarget;

			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				imgWidth = img.width,
				imgHeight = img.height,
				maxWidth = 100,
				maxHeight = 100,
				newWidth = imgWidth,
				newHeight = imgHeight;

			if(imgWidth > maxWidth) {
				newWidth = maxWidth;
				newHeight = imgHeight / (imgWidth / maxWidth);
			}

			if(imgHeight > maxHeight) {
				newHeight = maxHeight;
				newWidth = imgWidth / (imgHeight / maxHeight);
			}

			var excessWidth = newWidth % options.get('gridSize').get('value').value,
				excessHeight = newHeight % options.get('gridSize').get('value').value,
				offsetX = Math.floor(excessWidth / 2),
				offsetY = Math.floor(excessHeight / 2),
				fauxWidth = newWidth - excessWidth,
				fauxHeight = newHeight - excessHeight;

			{ //Debug
				console.groupCollapsed('Image Information');
				console.log('Element: %o', img);

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
			}

			ctx.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, newWidth, newHeight);
			var imgData = ctx.getImageData(offsetX, offsetY, fauxWidth, fauxHeight);

			this.getSegments(imgData);
		},

		getSegments: function(imgData) {
			this.segments.length = 0;
			this.trueLength = 0;

			var workerURL = require.toUrl('./ImageAnalyserWorker.js'),
				imgWidth = imgData.width,
				imgHeight = imgData.height,
				segmentWidth = imgWidth / numCols,
				segmentHeight = imgHeight / numRows;

			console.groupCollapsed('Image Data (Canvas Export)');
			console.log('Width: %i', imgWidth);
			console.log('Height: %i', imgHeight);
			console.log('Data length: %i', imgData.data.length);
			console.log('Data: %O', imgData.data); //Very slow, only use if needed for debugging
			console.groupEnd();

			console.groupCollapsed('Segment');
			console.log('Width: %i', segmentWidth);
			console.log('Height: %i', segmentHeight);

			for(var y = 0; y < numRows; y++) {
				//console.group('y: %i', y);

				for(var x = 0; x < numCols; x++) {
					var worker = new Worker(workerURL);

					worker.addEventListener('message', this._onWorkerMessage, false);

					worker.postMessage({
						cmd: 'doSegment',
						imgData: imgData,
						imgWidth: imgWidth,
						imgHeight: imgHeight,
						x: x,
						y: y,
						segmentWidth: segmentWidth,
						segmentHeight: segmentHeight
					});
				} //column

				//console.groupEnd();
			} // row

			//console.log(segments);

			console.groupEnd();

			//console.log(data);

			//return segments;
		},

		_onImageError: function(e) {
			console.log('Image failed to load %O', e);
		},

		_onWorkerMessage: function(e) {
			var data = e.data;
			if(data.id === 'segment') {
				//console.log(this.segments, this);
				//console.log(data.segment);
				this.segments[data.x + (data.y * numCols)] = data.segment;
				this.trueLength++;

				if(this.trueLength === numCols * numRows) {
					//console.log(this.segments);
					var segments = JSON.stringify(this.segments);
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {
							cmd: 'makeImage',
							segments: segments,
							numCols: numCols,
							numRows: numRows
						});
					});

					this._def.resolve(this.segments);
				}
			}
		}
	});

	return Cls;
});