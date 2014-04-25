define([
	'require',
	'jquery',
	'Class',
	'underscore',
	'model/option',
	'config'
], function(require, $, Class, _, option, config) {
	var Cls = Class.extend({
		//_imgSrc
		//_segments
		//_trueLength
		//_def
		//_cols
		//_rows

		init: function(imgSrc) {
			_.bindAll(this);

			this._imgSrc = imgSrc;
			this._segments = [];
			this._trueLength = 0;
			this._def = new $.Deferred();

			this._cols = option.get('gridColumn');
			this._rows = option.get('gridRow');
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
				oldWidth = imgWidth,
				oldHeight = imgHeight,
				width = imgWidth,
				height = imgHeight;

			if(imgWidth > maxWidth) {
				oldWidth = imgWidth;
				width = maxWidth;

				oldHeight = imgHeight;
				height = height / (oldWidth / maxWidth);
			}

			if(height > maxHeight) {
				oldHeight = height;
				height = maxHeight;

				oldWidth = width;
				width = width / (oldHeight / maxHeight);
			}

			var excessWidth = width % this._cols,
				excessHeight = height % this._rows,
				offsetX = Math.floor(excessWidth / 2),
				offsetY = Math.floor(excessHeight / 2),
				fauxWidth = width - excessWidth,
				fauxHeight = height - excessHeight;

			canvas.width = width;
			canvas.height = height;

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

			ctx.drawImage(
				img, 

				0, // Source X
				0,  // Source Y

				imgWidth, // Source Width
				imgHeight, // Source Height

				0, // Dest X
				0, // Dest Y

				width, // Dest Width
				height // Dest Height
			);
			console.log(canvas.toDataURL('image/png'));

			var imgData = ctx.getImageData(
				offsetX, 
				offsetY, 
				fauxWidth, 
				fauxHeight
			);

			this._doSegments(imgData);
		},

		_doSegments: function(imgData) {
			this._segments.length = 0;
			this._trueLength = 0;

			var workerURL = require.toUrl('./ImageAnalyserWorker.js'),
				imgWidth = imgData.width,
				imgHeight = imgData.height,
				segmentWidth = imgWidth / this._cols,
				segmentHeight = imgHeight / this._rows;

			console.groupCollapsed('Image Data (Canvas Export)');
			console.log('Width: %i', imgWidth);
			console.log('Height: %i', imgHeight);
			console.log('Data length: %i', imgData.data.length);
			console.log('Data: %O', imgData.data); //Very slow, only use if needed for debugging
			console.groupEnd();

			console.groupCollapsed('Segment');
			console.log('Width: %i', segmentWidth);
			console.log('Height: %i', segmentHeight);

			var workerPool = [],
				worker,
				poolSize = Math.min(config.THREAD_COUNT, this._cols * this._rows),
				i;

			for(i = 0; i < poolSize; i++) {
				worker = new Worker(workerURL);
				worker.addEventListener('message', this._onWorkerMessage, false);

				workerPool.push(worker);
				worker = null;
			}

			var workerIndex = 0;
			for(var y = 0; y < this._rows; y++) {
				for(var x = 0; x < this._cols; x++) {
					worker = workerPool[workerIndex];

					worker.postMessage({
						cmd: 'run',
						imgData: imgData,
						imgWidth: imgWidth,
						imgHeight: imgHeight,
						x: x,
						y: y,
						segmentWidth: segmentWidth,
						segmentHeight: segmentHeight
					});

					worker = null;

					workerIndex++;
					workerIndex = workerIndex % poolSize;
				} //column
			} // row

			for(i = 0; i < poolSize; i++) {
				worker = workerPool[i];
				worker.postMessage({
					cmd: 'end'
				});
				worker = null;
			}

			console.groupEnd();
		},

		_onImageError: function(e) {
			console.log('Image failed to load %O', e);

			$(document).trigger('flash-message', {
				msg: 'Image failed to load',
				type: 'error'
			});
		},

		_onWorkerMessage: function(e) {
			var data = e.data;
			if(data.id === 'segment') {
				var _this = this;
				
				this._segments[data.x + (data.y * this._cols)] = data.segment;
				this._trueLength++;

				if(this._trueLength === this._cols * this._rows) {
					if(config.DEBUG) {
						var segments = JSON.stringify(this._segments);
						chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
							chrome.tabs.sendMessage(tabs[0].id, {
								cmd: 'makeImage',
								segments: segments,
								numCols: _this._cols,
								numRows: _this._rows
							});
						});
					}

					this._def.resolve(this._segments);
				}
			}
		}
	});

	return Cls;
});