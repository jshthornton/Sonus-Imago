define([
	'require',
	'Class',
	'underscore',
	'collections/options'
], function(require, Class, _, options) {
	var Cls = Class.extend({
		//_imgSrc

		init: function(imgSrc) {
			_.bindAll(this);

			this._imgSrc = imgSrc;
		},

		loadImage: function(imgSrc) {
			this._imgSrc = this._imgSrc || imgSrc;
			if(typeof this._imgSrc !== 'string') throw new Error('Unable to load image. No image source provided.');

			var img = new Image();
			img.addEventListener('load', this._onImageLoad);
			img.addEventListener('error', this._onImageError);
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
				excessWidth = imgWidth % options.get('gridSize').get('value').value,
				excessHeight = imgHeight % options.get('gridSize').get('value').value,
				offsetX = Math.floor(excessWidth / 2),
				offsetY = Math.floor(excessHeight / 2),
				fauxWidth = imgWidth - excessWidth,
				fauxHeight = imgHeight - excessHeight;

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

			ctx.drawImage(img, 0, 0);

			console.log('Reading image data');
			var imgData = ctx.getImageData(offsetX, offsetY, fauxWidth, fauxHeight);

			canvas = null;

			this.getSegments(imgData);
		},

		getSegments: function(imgData) {
			var numCols = 5,
				numRows = 5,
				imgWidth = imgData.width,
				imgHeight = imgData.height,
				segmentWidth = imgWidth / numCols,
				segmentHeight = imgHeight / numRows;

			console.groupCollapsed('Image Data (Canvas Export)');
			console.log('Width: %i', imgWidth);
			console.log('Height: %i', imgHeight);
			console.log('Data length: %i', imgData.data.length);
			//console.log('Data: %O', imgData.data); //Very slow, only use if needed for debugging
			console.groupEnd();

			console.groupCollapsed('Segment');
			console.log('Width: %i', segmentWidth);
			console.log('Height: %i', segmentHeight);

			var segments = [];

			for(var y = 0; y < numRows; y++) {
				//console.group('y: %i', y);

				for(var x = 0; x < numCols; x++) {
					var worker = new Worker(require.toUrl('./ImageAnalyserWorker.js'));

					worker.addEventListener('message', function(e) {
						var data = e.data;
						if(data.id === 'segment') {
							console.log(data.segment);
						}
					}, false);

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

					//worker.postMessage({'cmd': 'stop'});
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
		}
	});

	return Cls;
});