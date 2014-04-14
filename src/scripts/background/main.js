require([
	'underscore'
], function(_) {
	var background = {
		init: function() {
			_.bindAll(this);

			this.setupPiano();

			chrome.runtime.onInstalled.addListener(this.onInstall);
			chrome.runtime.onMessage.addListener(this.onMessage);
		},

		setupPiano: function() {
			require([
				'libs/music',
				'libs/instruments/piano'
			], function(music, piano) {
				var audioContext = music.getAudioContext();
				piano.process(audioContext);
			});
		},

		onInstall: function() {
			require([
				'collections/options'
			], function(options) {
				options.localStorage._clear(); //@TODO: remove, dev only code.

				if(options.length === 0) {
					//Initial Setup
					options.resetInitial();
					options.saveAll();
				}
			});
		},

		onMessage: function(request, sender, sendResponse) {
			console.groupCollapsed('Message');

			switch(request.type) {
				case 'options':
					require([
						'collections/options',
					], function(options) {
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
						'background/ImageAnalyser',
						'collections/options',
						'collections/moodPacks',
						'libs/music',
						'libs/instruments/piano'
					], function(ImageAnalyser, options, moodPacks, music, piano) {
						options.fetch({
							reset: true,
							success: function() {
								var moodPackId = options.get('moodPack').get('value'),
									moodPack = moodPacks.get(moodPackId);

								if(music.get('playing') === true) {
									music.stop(true);
									return;
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
		}
	};

	background.init();
});