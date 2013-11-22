define([
	'Class',
	'underscore',
	'collections/options'
], function(Class, _, options) {
	var Cls = Class.extend({
		//_imgSrc

		init: function(imgSrc) {
			_.bindAll(this);

			this._imgSrc = imgSrc;
			if(imgSrc) this.loadImage(); 
		},

		loadImage: function(imgSrc) {
			this._imgSrc = this._imgSrc || imgSrc;
			if(typeof this._imgSrc !== 'string') throw new Error('Unable to load image. No image source provided.');

			var img = new Image();
			img.onload = this._onImageLoad;
			img.onerror = this._onImageError;
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
		},

		_onImageError: function(e) {
			console.log('Image failed to load %O', e);
		}
	});

	return Cls;
});