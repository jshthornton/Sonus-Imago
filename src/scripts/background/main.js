(function() {
	chrome.runtime.onInstalled.addListener(function() {
		require([
			'models/option'
		], function(option, debug) {
			console.log('Running install...');
			option.localStorage._clear(); //@TODO: remove, dev only code.

			//Initial Setup
			option.save();
		});
	});

	require([
		'underscore',
		'jquery'
	], function(_, $) {
		var background = {
			init: function() {
				_.bindAll(this);

				this.setupPiano();

				chrome.runtime.onMessage.addListener(this.onMessage);

				$(document).bind('flash-message', this.onFlashMessage);
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

			onMessage: function(request, sender, sendResponse) {
				var _this = this;

				console.groupCollapsed('Message');
				console.log('Request:', request);

				switch(request.type) {
					case 'option':
						require([
							'models/option',
						], function(option) {
							option.fetch({
								reset: true,
								success: function() {
									sendResponse(JSON.stringify(option));
									console.groupEnd();
								}
							});
						});

						break;

					case 'harmonise':
						require([
							'background/ImageAnalyser',
							'models/option',
							'collections/moodPacks',
							'libs/music',
							'libs/instruments/piano'
						], function(ImageAnalyser, option, moodPacks, music, piano) {
							option.fetch({
								reset: true,
								success: function() {
									var moodPackId = option.get('moodPack'),
										moodPack = moodPacks.get(moodPackId);

									console.log(moodPackId);

									if(music.get('playing') === true) {
										music.stop(true);
										return;
									}

									var pianoState = piano.ready.state();

									if(pianoState === 'pending') {
										_this.sendFlashMessage({
											tab: sender.tab, 
											msg: 'Waiting for music to initialise', 
											type: 'notice'
										});

										piano.ready.then(function() {
											_this.sendFlashMessage({
												tab: sender.tab, 
												msg: 'Music is ready, please retry', 
												type: 'notice'
											});
										});

										return;
									} 

									if(pianoState === 'rejected') {
										_this.sendFlashMessage({
											tab: sender.tab, 
											msg: 'Music failed to initialise, try reloading Sonus Imago extension', 
											type: 'error'
										});
										return;
									}

									var imageAnalyser = new ImageAnalyser(request.imageSrc);
									imageAnalyser.analyse().then(function(segments) {
										var music = moodPack.generateMusic(segments);

										music.onFinished(function() {
											console.log('Music Finished');
											sendResponse();
											console.groupEnd();
										});

										music.play();
									});
								}
							});
						});

						break;
				}

				return true;
			},

			onFlashMessage: function(e, data) {
				var _this = this;

				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					_this.sendFlashMessage({
						tab: tabs[0],
						msg: data.msg,
						type: data.type
					});
				});
			},

			sendFlashMessage: function(opts) {
				chrome.tabs.sendMessage(opts.tab.id, {
					cmd: 'flashMessage',
					msg: opts.msg,
					type: opts.type
				});
			}
		};

		background.init();
	});
}());

