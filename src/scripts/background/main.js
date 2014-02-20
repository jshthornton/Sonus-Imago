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
			'collections/options',
			'collections/moodPacks',
			'libs/instruments/piano'
		], function($, ImageAnalyser, options, moodPacks, piano) {
			options.fetch();

			var moodPackId = options.get('moodPack').get('value'),
				moodPack = moodPacks.get(moodPackId),
				music = moodPack.getMusicInstance();

			if(music.get('playing') === true) {
				return false;
			}

/*			var responseDef = new $.Deferred();

			responseDef.then(function() {
				sendResponse(Array.prototype.slice.call(arguments, 0));
				console.groupEnd(); //Message
			});*/

			console.groupCollapsed('Message');
			
			switch(request.type) {
				case 'getImageData':
					var imageAnalyser = new ImageAnalyser(request.imageSrc);
					imageAnalyser.analyse().then(function(segments) {
						/*	music.onFinished(function() {
								console.log('Finished');
								sendResponse();
							});*/
						
						piano.ready.then(function() {
							var music = moodPack.generateMusic(segments);
							music.play();
						});

						console.groupEnd();
					});

					//console.log('Request: %O', request);
					//getImageData(request.imageSrc, responseDef);
					break;
			}
		});

		return true;
	});

}());