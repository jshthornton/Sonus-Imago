(function() {
	/*
	Once the extension has been installed / reloaded setup the application
	*/
	chrome.runtime.onInstalled.addListener(function() {
		require([
			'model/option'
		], function(option) {
			console.log('Running install...');
			option.localStorage._clear(); //@TODO: remove, dev only code.

			// Save the default option values into localstorage
			option.save();
		});
	});

	require([
		'underscore',
		'jquery'
	], function(_, $) {
		/**
		 * The entry point script for the background script.
		 * It is used to setup client listeners and prepare the music.
		 *
		 * @module background
		 */
		var background = {
			/**
			 * Initalise the object. This method should only be called once. 
			 *
			 * @method init
			 */
			init: function() {
				_.bindAll(this);

				setTimeout(this._setupPiano, 500);

				chrome.runtime.onMessage.addListener(this._onMessage);

				// Listen for objects to requesting that flash messages be shown
				$(document).bind('flash-message', this._onFlashMessage);
			},

			/**
			 * Convenience function to invoke piano setup / processing.
			 *
			 * @method setupPiano
			 */
			_setupPiano: function() {
				require([
					'lib/music',
					'lib/instrument/piano'
				], function(music, piano) {
					var audioContext = music.getAudioContext();
					piano.process(audioContext);
				});
			},

			/**
			 * Event fired when the client sends a message to the background.
			 * Used to retrieve options from the background and process an image.
			 * 
			 * @event onMessage
			 * @param {String} request.type The request type. 
			 * `option` will return saved options to the client.
			 * `harmonise` will start the image analysation process.
			 * @param {String} request.imgSrc The url of the image to process. Used when `request.type = 'harmonise'`.
			 * @private
			 */
			_onMessage: function(request, sender, sendResponse) {
				var _this = this;

				console.log('Message');
				console.log('Request:', request);

				switch(request.type) {
					case 'option':
						require([
							'model/option',
						], function(option) {
							// Load options from localstorage
							option.fetch({
								reset: true,
								success: function() {
									sendResponse(JSON.stringify(option)); // Send the options to the client
								}
							});
						});

						break;

					case 'harmonise':
						require([
							'background/ImageAnalyser',
							'model/option',
							'collection/moodPacks',
							'lib/music',
							'lib/instrument/piano'
						], function(ImageAnalyser, option, moodPacks, music, piano) {
							// Load options from localstorage
							option.fetch({
								reset: true,
								success: function() {
									// If the music is already playing stop it
									if(music.get('playing') === true) {
										music.destroy();
										console.log('Music Stopped');
										sendResponse();
										return;
									}
									
									// Get the user selected mood pack
									var moodPackId = option.get('moodPackId'),
										moodPack = moodPacks.get(moodPackId);


									var pianoState = piano.ready.state();
									// If the piano is not ready inform the client
									if(pianoState === 'pending') {
										_this.sendFlashMessage({
											tab: sender.tab, 
											msg: 'Waiting for music to initialise', 
											type: 'notice'
										});
										// Inform the client once the piano is ready (only if they have previously been told it is not ready)
										piano.ready.then(function() {
											_this.sendFlashMessage({
												tab: sender.tab, 
												msg: 'Music is ready, please retry', 
												type: 'notice'
											});
										});

										return;
									} 
									// Inform the client of a broken piano
									if(pianoState === 'rejected') {
										_this.sendFlashMessage({
											tab: sender.tab, 
											msg: 'Music failed to initialise, try reloading Sonus Imago extension', 
											type: 'error'
										});
										return;
									}
									var imageAnalyser = new ImageAnalyser(request.imageSrc);
									// Process the image. Once it is done generate the music.
									imageAnalyser.analyse().then(function(segments) {
										var music = moodPack.generateMusic(segments);

										music.onFinished(function() {
											console.log('Music Finished');
											sendResponse();
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

			/**
			 * Finds the active tab of the current window then sends it a message from the even parameters.
			 * 
			 * @event onFlashMessage
			 * @param {Object} e jQuery event object
			 * @param {String} data.msg Text to display in the flash.
			 * @param {String} data.type Type of flash message, `error` or `notice`.
			 * @private
			 */
			_onFlashMessage: function(e, data) {
				var _this = this;

				// Find the active tab of the current window, then send it the message.
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					_this.sendFlashMessage({
						tab: tabs[0],
						msg: data.msg,
						type: data.type
					});
				});
			},

			/**
			 * Helper function to tell the client to display a flash message.
			 * 
			 * @method sendFlashMessage
			 * @param {Object} opts.tab The tab to send the message to.
			 * @param {String} opts.msg The text to display in the flash.
			 * @param {string} opts.type The type of flash message `error` or `notice`.
			 */
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

