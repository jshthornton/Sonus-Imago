/**
 * Band.js - Music Composer
 * An interface for the Web Audio API that supports rhythms, multiple instruments, repeating sections, and complex
 * time signatures.
 *
 * @author Cody Lundquist (http://github.com/meenie) - 2013
 */
;(function() {
	var
		packs = {
			instrument: {},
			rhythm: {},
			tuning: {}
		},
		// Used when parsing the time signature
		signatureToNoteLengthRatio = {
			2: 6,
			4: 3,
			8: 4.50
		}
	;

	/**
	 * Constructor
	 */
	function cls(tuning, rhythm) {
		if (! tuning) {
			tuning = 'equalTemperament';
		}

		if (! rhythm) {
			rhythm = 'northAmerican';
		}

		if (typeof packs.tuning[tuning] === 'undefined') {
			throw new Error(tuning + ' is not a valid tuning pack.');
		}

		if (typeof packs.rhythm[rhythm] === 'undefined') {
			throw new Error(rhythm + ' is not a valid rhythm pack.');
		}

		var self = this,
			ac = new (window.AudioContext || window.webkitAudioContext),
			muteGain = ac.createGain(),
			masterVolume = ac.createGain(),
			masterVolumeLevel = 1,
			beatsPerBar,
			noteGetsBeat,
			pitches = packs.tuning[tuning],
			notes = packs.rhythm[rhythm],
			tempo,
			instruments = [],
			allSounds = [],
			currentPlayTime,
			totalPlayTime = 0,
			totalDuration = 0,
			currentSeconds = 0,
			defaultBufferSize = 50,
			bufferTimeout,
			decodeDeferred,
			tickerCallback,
			paused = false,
			playing = false,
			loop = false,
			muted = false,
			faded = false,
			onFinishedCallback,
			onFinished = function(cb) {
				self.stop(false);
				if (loop) {
					self.play();
				} else if(typeof cb === 'function') {
					cb();
				}
			},
			totalPlayTimeCalculator = function() {
				if (! paused && playing) {
					if (totalDuration < totalPlayTime) {
						onFinished(onFinishedCallback);
					} else {
						updateTotalPlayTime();
						requestAnimationFrame(totalPlayTimeCalculator);
					}
				}
			},
			/**
			 * Instrument Class
			 */
			Instrument = (function() {
				/**
				 * Constructor
				 * @param name
				 * @param pack
				 */
				function cls(name, pack) {
					// Default to Sine Oscillator
					if (! name) {
						name = 'sine';
					}
					if (! pack) {
						pack = 'oscillators';
					}

					if (typeof packs.instrument[pack] === 'undefined') {
						throw new Error (pack + ' is not a currently loaded Instrument Pack.');
					}

					var self = this,
						currentTime = 0,
						lastRepeatCount = 0,
						volumeLevel = 1,
						soundsBuffer = [],
						instrument = packs.instrument[pack](name, ac)
					;

					/**
					 * Set volume level for an instrument
					 *
					 * @param newVolumeLevel
					 */
					this.setVolume = function(newVolumeLevel) {
						if (newVolumeLevel > 1) {
							newVolumeLevel = newVolumeLevel / 100;
						}
						volumeLevel = newVolumeLevel;

						return self;
					};

					/**
					 * Add a note to an instrument
					 * @param rhythm
					 * @param [pitch] - Comma separated string if more than one pitch
					 * @param [tie]
					 */
					this.note = function(rhythm, pitch, tie) {
						if (typeof notes[rhythm] === 'undefined') {
							throw new Error(rhythm + ' is not a correct rhythm.');
						}

						var duration = getDuration(rhythm),
							articulationGap = tie ? 0 : duration * 0.05;

						if (pitch) {
							pitch = pitch.split(',');
							pitch.forEach(function(p) {
								p = p.trim();
								if (typeof pitches[p] === 'undefined') {
									throw new Error(p + ' is not a valid pitch.');
								}
							});
						}

						soundsBuffer.push({
							pitch: pitch,
							duration: duration,
							articulationGap: articulationGap,
							tie: tie,
							startTime: currentTime,
							// Volume needs to be a quarter of the master so it doesn't clip
							volumeLevel: volumeLevel / 4,
							stopTime: currentTime + duration - articulationGap
						});

						currentTime += duration;

						return self;
					};

					/**
					 * Add a rest to an instrument
					 *
					 * @param rhythm
					 */
					this.rest = function(rhythm) {
						if (typeof notes[rhythm] === 'undefined') {
							throw new Error(rhythm + ' is not a correct rhythm.');
						}

						var duration = getDuration(rhythm);

						soundsBuffer.push({
							pitch: false,
							duration: duration,
							articulationGap: 0,
							startTime: currentTime,
							stopTime: currentTime + duration
						});

						currentTime += duration;

						return self;
					};

					/**
					 * Place where a repeat section should start
					 */
					this.repeatStart = function() {
						lastRepeatCount = soundsBuffer.length;

						return self;
					};

					/**
					 * Repeat from beginning
					 */
					this.repeatFromBeginning = function(numOfRepeats) {
						lastRepeatCount = 0;
						self.repeat(numOfRepeats);

						return self;
					};

					/**
					 * Number of times the section should repeat
					 * @param [numOfRepeats] - defaults to 1
					 */
					this.repeat = function(numOfRepeats) {
						numOfRepeats = typeof numOfRepeats === 'undefined' ? 1 : numOfRepeats;
						var soundsBufferCopy = soundsBuffer.slice(lastRepeatCount);
						for (var r = 0; r < numOfRepeats; r++) {
							soundsBufferCopy.forEach(function(sound) {
								var soundCopy = clone(sound);

								soundCopy.startTime = currentTime;
								soundCopy.stopTime = currentTime + soundCopy.duration - soundCopy.articulationGap;

								soundsBuffer.push(soundCopy);
								currentTime += soundCopy.duration;
							});
						}

						return self;
					};

					/**
					 * Copies all notes to the master list of notes. It also calculates the total duration
					 * of each instrument.
					 */
					this.finish = function() {
						var duration = 0;
						soundsBuffer.forEach(function(sound) {
							duration += sound.duration;
						});
						// Figure out longest duration out of all the instruments
						if (duration > totalDuration) {
							totalDuration = duration;
						}
						instruments.push({
							instrument: instrument,
							sounds: soundsBuffer,
							bufferPosition: 0,
							totalDuration: totalDuration
						});
					};
				}

				return cls;
			})()
		;

		// Setup mute gain and connect to the context
		muteGain.gain.value = 0;
		muteGain.connect(ac.destination);

		// Setup master volume and connect to the context
		masterVolume.gain.value = 1;
		masterVolume.connect(ac.destination);

		this.get = function(key) {
			switch(key) {
				case 'playing':
					return playing;
			}
		};

		/**
		 * Use JSON to load in a song to be played
		 *
		 * @param json
		 */
		this.load = function(json) {
			this.destroy();

			if (! json) {
				throw new Error('JSON is required for this method to work.');
			}
			// Need to have at least instruments and notes
			if (typeof json['instruments'] === 'undefined') {
				throw new Error('You must define at least one instrument');
			}
			if (typeof json['notes'] === 'undefined') {
				throw new Error('You must define notes for each instrument');
			}

			// Shall we set a time signature?
			if (typeof json['timeSignature'] !== 'undefined') {
				self.setTimeSignature(json['timeSignature'][0], json['timeSignature'][1]);
			}

			// Maybe some tempo?
			if (typeof json['tempo'] !== 'undefined') {
				self.setTempo(json['tempo']);
			}

			// Lets create some instruments
			var instrumentList = {};
			for (var instrument in json['instruments']) {
				if (! json['instruments'].hasOwnProperty(instrument)) {
					continue;
				}

				instrumentList[instrument] = self.createInstrument(
					json['instruments'][instrument].name,
					json['instruments'][instrument].pack
				);
			}

			// Now lets add in each of the notes
			for (var inst in json['notes']) {
				if (! json['notes'].hasOwnProperty(inst)) {
					continue;
				}
				json['notes'][inst].forEach(function(note) {
					// Use shorthand if it's a string
					if (typeof note === 'string') {
						var noteParts = note.split('|');
						if ('rest' === noteParts[1]) {
							instrumentList[inst].rest(noteParts[0]);
						} else {
							instrumentList[inst].note(noteParts[0], noteParts[1], noteParts[2]);
						}
					// Otherwise use longhand
					} else {
						if ('rest' === note.type) {
							instrumentList[inst].rest(note.rhythm);
						} else if ('note' === note.type) {
							instrumentList[inst].note(note.rhythm, note.pitch, note.tie);
						}
					}
				});
				instrumentList[inst].finish();
			}

			// Looks like we are done, lets press it.
			self.end();
		};

		/**
		 * Create a new instrument
		 *
		 * @param [name] - defaults to sine
		 * @param [pack] - defaults to oscillators
		 * @returns {Instrument}
		 */
		this.createInstrument = function(name, pack) {
			return new Instrument(name, pack);
		};

		/**
		 * Stop playing all music and rewind the song
		 *
		 * @param fadeOut boolean - should the song fade out?
		 */
		this.stop = function(fadeOut) {
			playing = false;
			currentSeconds = 0;

			if (typeof fadeOut === 'undefined') {
				fadeOut = true;
			}
			if (fadeOut && ! muted) {
				fade('down', function() {
					totalPlayTime = 0;
					reset();
					// Make callback asynchronous
					if(typeof tickerCallback === 'function') {
						setTimeout(function() {
							tickerCallback(currentSeconds);
						}, 1);
					}
				}, true);
			} else {
				totalPlayTime = 0;
				reset();
				// Make callback asynchronous
				if(typeof tickerCallback === 'function') {
					setTimeout(function() {
						tickerCallback(currentSeconds);
					}, 1);
				}
			}
		};

		/**
		* Stop playing all music and destroy all instruments and notes
		*/
		this.destroy = function() {
			this.stop(false);
			totalDuration = 0;
			instruments = [];
		};

		/**
		 * Set Master Volume
		 */
		this.setMasterVolume = function(newVolume) {
			if (newVolume > 1) {
				newVolume = newVolume / 100;
			}
			masterVolumeLevel = newVolume;
			masterVolume.gain.value = masterVolumeLevel;
		};

		/**
		 * Mute all of the music
		 */
		this.mute = function(cb) {
			muted = true;
			fade('down', cb);
		};

		/**
		 * Unmute all of the music
		 */
		this.unmute = function(cb) {
			muted = false;
			fade('up', cb);
		};

		/**
		 * Grab the total duration of a song
		 *
		 * @returns {number}
		 */
		this.getTotalSeconds = function() {
			return Math.round(totalDuration);
		};

		this.getAudioContext = function() {
			return ac;
		};

		/**
		 * Sets the ticker callback function. This function will be called
		 * every time the current seconds has changed.
		 *
		 * @param cb function
		 */
		this.setTicker = function (cb) {
			if (typeof cb !== 'function') {
				throw new Error('Ticker must be a function.');
			}

			tickerCallback = cb;
		};

		/**
		 * Needs to be called after all the instruments have been marked off as
		 * finished.
		 *
		 * Buffers up the initial sounds so they can be instantly played.
		 */
		this.end = function() {
			// Reset the buffer position of all instruments
			instruments.forEach(function(instrument) {
				instrument.bufferPosition = 0;
			});
			// Setup initials sounds
			allSounds = this.bufferSounds();
		};

		/**
		 * Grabs a set of sounds based on the current time and what the Buffer Size is.
		 * It will also skip any sounds that have a start time less than the
		 * total play time.
		 */
		this.bufferSounds = function(bufferSize) {
			// Default buffer amount to 50 notes
			if (! bufferSize) {
				bufferSize = defaultBufferSize;
			}

			var sounds = [];
			instruments.forEach(function(instrument) {
				// Create volume for this instrument
				var bufferCount = bufferSize;

				for (var i = 0; i < bufferCount; i++) {
					var sound = instrument.sounds[instrument.bufferPosition + i];

					if (typeof sound === 'undefined') {
						break;
					}

					var pitch = sound.pitch,
						startTime = sound.startTime,
						stopTime = sound.stopTime,
						volumeLevel = sound.volumeLevel;

					if (startTime < totalPlayTime) {
						bufferCount++;
						continue;
					}

					// If pitch is false, then it's a rest and we don't need a sound
					if (false !== pitch) {
						var gain = ac.createGain();
						// Connect volume gain to the Master Volume;
						gain.connect(masterVolume);
						gain.gain.value = volumeLevel;

						if (typeof pitch === 'undefined') {
							sounds.push({
								startTime: startTime,
								stopTime: stopTime,
								node: instrument.instrument.createSound(gain),
								gain: gain,
								volumeLevel: volumeLevel
							});
						} else {
							pitch.forEach(function(p) {
								sounds.push({
									startTime: startTime,
									stopTime: stopTime,
									node: instrument.instrument.createSound(gain, pitches[p.trim()], p.trim()),
									gain: gain,
									volumeLevel: volumeLevel
								});
							});
						}
					}
				}
				instrument.bufferPosition += bufferCount;
			});

			// Return array of sounds
			return sounds;
		};

		/**
		 * Sets the time signature for the music. Just like in notation 4/4 time would be setTimeSignature(4, 4);
		 * @param top - Number of beats per bar
		 * @param bottom - What note type has the beat
		 */
		this.setTimeSignature = function(top, bottom) {
			if (typeof signatureToNoteLengthRatio[bottom] === 'undefined') {
				throw new Error('The bottom time signature is not supported.');
			}

			// Not used at the moment, but will be handy in the future.
			beatsPerBar = top;
			noteGetsBeat = signatureToNoteLengthRatio[bottom];
		};

		/**
		 * Sets the tempo
		 *
		 * @param t
		 */
		this.setTempo = function(t) {
			tempo = 60 / t;
		};

		/**
		 * Grabs currently buffered sound nodes and calls their start/stop methods.
		 *
		 * It then sets up a timer to buffer up the next set of notes based on the
		 * a set buffer size.  This will keep going until the song is stopped or paused.
		 *
		 * It will use the total time played so far as an offset so you pause/play the music
		 */
		this.play = function() {
			playing = true;
			paused = false;
			// Starts calculator which keeps track of total play time
			currentPlayTime = ac.currentTime;
			totalPlayTimeCalculator();
			var timeOffset = ac.currentTime - totalPlayTime,
				playSounds = function(sounds) {
					sounds.forEach(function(sound) {
						var startTime = sound.startTime + timeOffset,
							stopTime = sound.stopTime + timeOffset
						;

						/**
						 * If no tie, then we need to introduce a volume ramp up to remove any clipping
						 * as Oscillators have an issue with this when playing a note at full volume.
						 * We also put in a slight ramp down as well.  This only takes up 1/1000 of a second.
						 */
						if (! sound.tie) {
							startTime -= 0.001;
							stopTime += 0.001;
							sound.gain.gain.setValueAtTime(0.0, startTime);
							sound.gain.gain.linearRampToValueAtTime(sound.volumeLevel, startTime + 0.001);
							sound.gain.gain.setValueAtTime(sound.volumeLevel, stopTime - 0.001);
							sound.gain.gain.linearRampToValueAtTime(0.0, stopTime);
						}

						sound.node.start(startTime);
						sound.node.stop(stopTime);
					});
				},
				bufferUp = function() {
					bufferTimeout = setTimeout(function() {
						if (playing & ! paused) {
							var newSounds = self.bufferSounds();
							if (newSounds.length > 0) {
								playSounds(newSounds);
								allSounds = allSounds.concat(newSounds);
								bufferUp();
							}
						}
					}, 5000);
				};

			playSounds(allSounds);
			bufferUp();

			if (faded && ! muted) {
				fade('up');
			}
		};

		/**
		 * Set a callback to fire when the song is finished
		 *
		 * @param cb
		 */
		this.onFinished = function(cb) {
			if (typeof cb !== 'function') {
				throw new Error('onFinished callback must be a function.');
			}

			onFinishedCallback = cb;
		};

		/**
		 * Pauses the music, resets the sound nodes,
		 * and gets the total time played so far
		 */
		this.pause = function() {
			paused = true;
			updateTotalPlayTime();
			if (muted) {
				reset();
			} else {
				fade('down', function() {
					reset();
				});
			}
		};

		/**
		 * Set true if you want the song to loop
		 *
		 * @param l
		 */
		this.loop = function(l) {
			loop = l;
		};

		/**
		 * Set a specific time that the song should start it.
		 * If it's already playing, reset and start the song
		 * again so it has a seamless jump.
		 *
		 * @param newTime
		 */
		this.setTime = function(newTime) {
			totalPlayTime = parseInt(newTime);
			reset();
			if (playing && ! paused) {
				self.play();
			}
		};

		// Default to 120 tempo
		this.setTempo(120);

		// Default to 4/4 time signature
		this.setTimeSignature(4, 4);

		/**
		 * Call to update the total play time so far
		 */
		function updateTotalPlayTime() {
			totalPlayTime += ac.currentTime - currentPlayTime;
			var seconds = Math.round(totalPlayTime);
			if (seconds != currentSeconds) {
				// Make callback asynchronous
				setTimeout(function() {
					tickerCallback(seconds);
				}, 1);
				currentSeconds = seconds;
			}
			currentPlayTime = ac.currentTime;
		}

		/**
		 * Helper function to figure out how long a note is
		 *
		 * @param note
		 * @returns {number}
		 */
		function getDuration(note) {
			return notes[note] * tempo / noteGetsBeat * 10;
		}

		/**
		 * Helper function to stop all sound nodes
		 * then call self.end() to re-buffer them
		 */
		function reset() {
			clearTimeout(bufferTimeout);
			allSounds.forEach(function(sound) {
				if (sound.node && sound.node.playbackState === sound.node.PLAYING_STATE) {
					sound.node.stop(0);
				}
			});
			self.end();
		}

		/**
		 * Helper function to fade up/down master volume
		 *
		 * @param direction - up or down
		 * @param [cb] - Callback function fired after the transition is completed
		 * @param [resetVolume] - Reset the volume back to it's original level
		 */
		function fade(direction, cb, resetVolume) {
			if (typeof resetVolume === 'undefined') {
				resetVolume = false;
			}
			if ('up' !== direction && 'down' !== direction) {
				throw new Error('Direction must be either up or down.');
			}
			faded = direction === 'down';
			var i = 100 * masterVolumeLevel,
				fadeTimer = function() {
					if (i > 0) {
						i = i - 4;
						i = i < 0 ? 0 : i;
						var gain = 'up' === direction ? masterVolumeLevel * 100 - i : i;
						masterVolume.gain.value = gain / 100;
						requestAnimationFrame(fadeTimer);
					} else {
						if (typeof cb === 'function') {
							cb();
						}

						if (resetVolume) {
							faded = ! faded;
							masterVolume.gain.value = masterVolumeLevel;
						}
					}
				};

			fadeTimer();
		}
	}

	/**
	 * Loads either a Tuning, Rhythm, or Instrument pack
	 * 
	 * @param type
	 * @param name
	 * @param data
	 */
	cls.loadPack = function(type, name, data) {
		if (['tuning', 'rhythm', 'instrument'].indexOf(type) === -1) {
			throw new Error(type = ' is not a valid Pack Type.');
		}

		if (typeof packs[type][name] !== 'undefined') {
			throw new Error('A(n) ' + type + ' pack with the name "' + name + '" has already been loaded.');
		}

		packs[type][name] = data;
	};

	/**
	 * Helper function to clone an object
	 *
	 * @param obj
	 * @returns {copy}
	 */
	function clone(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}

		return copy;
	}

	var requestAnimationFrame = this.requestAnimationFrame || this.mozRequestAnimationFrame ||
		this.webkitRequestAnimationFrame || this.msRequestAnimationFrame;

	this.requestAnimationFrame = requestAnimationFrame;

	// Export for CommonJS
	if (typeof module === 'object' && module && typeof module.exports === 'object' ) {
		module.exports = cls;
	// Define AMD module
	} else if (typeof define === 'function' && define.amd) {
		// Return the library as an AMD module:
		define([], function() {
			return cls;
		});
	// Or make it global
	} else {
		this.BandJS = cls;
	}

	//Packs
	/**
	 * Oscillator Instrument Pack,
	 */
	cls.loadPack('instrument', 'oscillators', function(name, audioContext) {
		var types = {
			sine: 0,
			square: 1,
			sawtooth: 2,
			triangle: 3
		};

		if (typeof types[name] === 'undefined') {
			throw new Error(name + ' is not a valid Oscillator type');
		}

		return {
			createSound: function(destination, frequency) {
				var o = audioContext.createOscillator();

				// Connect note to volume
				o.connect(destination);
				// Set pitch type
				o.type = types[name];
				// Set frequency
				o.frequency.value = frequency;

				return o;
			}
		};
	});
	
	/**
	 * Equal Temperament tuning
	 * Source: http://www.phy.mtu.edu/~suits/notefreqs.html
	 */
	cls.loadPack('tuning', 'equalTemperament', {
		'C0': 16.35,
		'C#0': 17.32,
		'Db0': 17.32,
		'D0': 18.35,
		'D#0': 19.45,
		'Eb0': 19.45,
		'E0': 20.60,
		'F0': 21.83,
		'F#0': 23.12,
		'Gb0': 23.12,
		'G0': 24.50,
		'G#0': 25.96,
		'Ab0': 25.96,
		'A0': 27.50,
		'A#0': 29.14,
		'Bb0': 29.14,
		'B0': 30.87,
		'C1': 32.70,
		'C#1': 34.65,
		'Db1': 34.65,
		'D1': 36.71,
		'D#1': 38.89,
		'Eb1': 38.89,
		'E1': 41.20,
		'F1': 43.65,
		'F#1': 46.25,
		'Gb1': 46.25,
		'G1': 49.00,
		'G#1': 51.91,
		'Ab1': 51.91,
		'A1': 55.00,
		'A#1': 58.27,
		'Bb1': 58.27,
		'B1': 61.74,
		'C2': 65.41,
		'C#2': 69.30,
		'Db2': 69.30,
		'D2': 73.42,
		'D#2': 77.78,
		'Eb2': 77.78,
		'E2': 82.41,
		'F2': 87.31,
		'F#2': 92.50,
		'Gb2': 92.50,
		'G2': 98.00,
		'G#2': 103.83,
		'Ab2': 103.83,
		'A2': 110.00,
		'A#2': 116.54,
		'Bb2': 116.54,
		'B2': 123.47,
		'C3': 130.81,
		'C#3': 138.59,
		'Db3': 138.59,
		'D3': 146.83,
		'D#3': 155.56,
		'Eb3': 155.56,
		'E3': 164.81,
		'F3': 174.61,
		'F#3': 185.00,
		'Gb3': 185.00,
		'G3': 196.00,
		'G#3': 207.65,
		'Ab3': 207.65,
		'A3': 220.00,
		'A#3': 233.08,
		'Bb3': 233.08,
		'B3': 246.94,
		'C4': 261.63,
		'C#4': 277.18,
		'Db4': 277.18,
		'D4': 293.66,
		'D#4': 311.13,
		'Eb4': 311.13,
		'E4': 329.63,
		'F4': 349.23,
		'F#4': 369.99,
		'Gb4': 369.99,
		'G4': 392.00,
		'G#4': 415.30,
		'Ab4': 415.30,
		'A4': 440.00,
		'A#4': 466.16,
		'Bb4': 466.16,
		'B4': 493.88,
		'C5': 523.25,
		'C#5': 554.37,
		'Db5': 554.37,
		'D5': 587.33,
		'D#5': 622.25,
		'Eb5': 622.25,
		'E5': 659.26,
		'F5': 698.46,
		'F#5': 739.99,
		'Gb5': 739.99,
		'G5': 783.99,
		'G#5': 830.61,
		'Ab5': 830.61,
		'A5': 880.00,
		'A#5': 932.33,
		'Bb5': 932.33,
		'B5': 987.77,
		'C6': 1046.50,
		'C#6': 1108.73,
		'Db6': 1108.73,
		'D6': 1174.66,
		'D#6': 1244.51,
		'Eb6': 1244.51,
		'E6': 1318.51,
		'F6': 1396.91,
		'F#6': 1479.98,
		'Gb6': 1479.98,
		'G6': 1567.98,
		'G#6': 1661.22,
		'Ab6': 1661.22,
		'A6': 1760.00,
		'A#6': 1864.66,
		'Bb6': 1864.66,
		'B6': 1975.53,
		'C7': 2093.00,
		'C#7': 2217.46,
		'Db7': 2217.46,
		'D7': 2349.32,
		'D#7': 2489.02,
		'Eb7': 2489.02,
		'E7': 2637.02,
		'F7': 2793.83,
		'F#7': 2959.96,
		'Gb7': 2959.96,
		'G7': 3135.96,
		'G#7': 3322.44,
		'Ab7': 3322.44,
		'A7': 3520.00,
		'A#7': 3729.31,
		'Bb7': 3729.31,
		'B7': 3951.07,
		'C8': 4186.01
	});

	/**
	 * European rhythm names
	 */
	cls.loadPack('rhythm', 'european', {
		semibreve: 1,
		dottedMinim: 0.75,
		minim: 0.5,
		dottedCrotchet: 0.375,
		tripletMinim: 0.33333334,
		crotchet: 0.25,
		dottedQuaver: 0.1875,
		tripletCrotchet: 0.166666667,
		quaver: 0.125,
		dottedSemiquaver: 0.09375,
		tripletQuaver: 0.083333333,
		semiquaver: 0.0625,
		tripletSemiquaver: 0.041666667,
		demisemiquaver: 0.03125
	});

}).call(function() {
	return this || (typeof window !== 'undefined' ? window : global);
}());