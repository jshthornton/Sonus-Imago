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
					imageAnalyser.loadImage();

					//console.log('Request: %O', request);
					//getImageData(request.imageSrc, responseDef);
					break;
			}
		});

		return true;
	});

}());