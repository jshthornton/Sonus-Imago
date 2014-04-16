define([
	'require',
	'jquery',
	'Class',
	'underscore',
	'models/option',
	'debug',
	'config'
], function(require, $, Class, _, option, debug, config) {
	var Cls = Class.extend({
		//_imgSrc
		//segments
		//trueLength
		//_def
		//cols
		//rows

		init: function(imgSrc) {
			_.bindAll(this);

			this._imgSrc = imgSrc;
			this.segments = [];
			this.trueLength = 0;
			this._def = new $.Deferred();

			this.cols = option.get('gridColumn'),
			this.rows = option.get('gridRow');
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

			debug.log('Loading Image: %s', this._imgSrc);

			img = null;
		},

		_onImageLoad: function(e) {
			debug.log('Image Loaded');

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

			var excessWidth = newWidth % this.cols,
				excessHeight = newHeight % this.rows,
				offsetX = Math.floor(excessWidth / 2),
				offsetY = Math.floor(excessHeight / 2),
				fauxWidth = newWidth - excessWidth,
				fauxHeight = newHeight - excessHeight;

			{ //Debug
				debug.groupCollapsed('Image Information');
				debug.log('Element: %o', img);

				debug.groupCollapsed('Raw');
				debug.log('Width: %i', imgWidth);
				debug.log('Height: %i', imgHeight);
				debug.groupEnd();

				debug.groupCollapsed('Excess');
				debug.log('Width: %i', excessWidth);
				debug.log('Height: %i', excessHeight);
				debug.groupEnd();

				debug.groupCollapsed('Offset');
				debug.log('X: %i', offsetX);
				debug.log('Y: %i', offsetY);
				debug.groupEnd();

				debug.groupCollapsed('Faux');
				debug.log('Width: %i', fauxWidth);
				debug.log('Height: %i', fauxHeight);
				debug.groupEnd();

				debug.groupEnd();
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
				segmentWidth = imgWidth / this.cols,
				segmentHeight = imgHeight / this.rows;

			debug.groupCollapsed('Image Data (Canvas Export)');
			debug.log('Width: %i', imgWidth);
			debug.log('Height: %i', imgHeight);
			debug.log('Data length: %i', imgData.data.length);
			debug.log('Data: %O', imgData.data); //Very slow, only use if needed for debugging
			debug.groupEnd();

			debug.groupCollapsed('Segment');
			debug.log('Width: %i', segmentWidth);
			debug.log('Height: %i', segmentHeight);


			var workerPool = [],
				poolSize = Math.min(config.THREAD_COUNT, this.cols * this.rows);
				
			for(var i = 0; i < poolSize; i++) {
				var worker = new Worker(workerURL);
				worker.addEventListener('message', this._onWorkerMessage, false);

				workerPool.push(worker);
				worker = null;
			}

			var workerIndex = 0;
			for(var y = 0; y < this.rows; y++) {
				for(var x = 0; x < this.cols; x++) {
					var worker = workerPool[workerIndex];

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

					workerIndex++;
					workerIndex = workerIndex % poolSize;
				} //column
			} // row

			for(var i = 0; i < poolSize; i++) {
				var worker = workerPool[i];
				worker.postMessage({
					cmd: 'end'
				});
				worker = null;
			}

			debug.groupEnd();
		},

		_onImageError: function(e) {
			debug.log('Image failed to load %O', e);

			$(document).trigger('flash-message', {
				msg: 'Image failed to load',
				type: 'error'
			});
		},

		_onWorkerMessage: function(e) {
			var data = e.data;
			if(data.id === 'segment') {
				var _this = this;
				
				this.segments[data.x + (data.y * this.cols)] = data.segment;
				this.trueLength++;

				if(this.trueLength === this.cols * this.rows) {
					if(config.DEBUG) {
						var segments = JSON.stringify(this.segments);
						chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
							chrome.tabs.sendMessage(tabs[0].id, {
								cmd: 'makeImage',
								segments: segments,
								numCols: _this.cols,
								numRows: _this.rows
							});
						});
					}

					this._def.resolve(this.segments);
				}
			}
		}
	});

	return Cls;
});