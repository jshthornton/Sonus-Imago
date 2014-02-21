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

	require([
		'models/MoodPack/_Base',
		'libs/instruments/piano'
	], function(MoodPack, piano) {
		var audioContext = MoodPack.music.getAudioContext();
		piano.process(audioContext);
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.groupCollapsed('Message');

		switch(request.type) {
			case 'options':
				require([
					'underscore',
					'collections/options',
				], function(_, options) {
					options.fetch({
						reset: true,
						success: function() {
							var _options = _.indexBy(options.models, 'id');

							sendResponse(JSON.stringify(_options));
							console.groupEnd();

						}
					});
				});

				break;

			case 'harmonise':
				require([
					'jquery',
					'background/ImageAnalyser',
					'collections/options',
					'collections/moodPacks',
					'libs/instruments/piano'
				], function($, ImageAnalyser, options, moodPacks, piano) {

					options.fetch({
						reset: true,
						success: function() {
							var moodPackId = options.get('moodPack').get('value'),
								moodPack = moodPacks.get(moodPackId),
								music = moodPack.getMusicInstance();

							if(music.get('playing') === true) {
								return false;
							}

							var imageAnalyser = new ImageAnalyser(request.imageSrc);
							imageAnalyser.analyse().then(function(segments) {
								piano.ready.then(function() {
									var music = moodPack.generateMusic(segments);

									music.onFinished(function() {
										console.log('Finished');
										sendResponse();
										console.groupEnd();
									});

									music.play();
								});
							});
						}
					});
				});

				break;
		}

		return true;
	});
}());