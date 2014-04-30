define([
	'underscore',
	'Band',
	'jquery',
	'lib/Base64Binary',
	'lib/soundfont/acoustic_grand_piano-ogg'
], function(_, Band, $, Base64Binary, pianoData) {
	var _def = new $.Deferred(),
		_buffers = {},
		total,
		finishedCount;

	var piano = {
		ready: _def.promise(),
		process: _.once(function(audioContext) {
			total = 0;
			finishedCount = 0;

			_.forOwn(pianoData.data, function(base64_str, pitch) {
				total++;

				var arrayBuffer = Base64Binary.decodeArrayBuffer(base64_str);

				audioContext.decodeAudioData(arrayBuffer, function(buffer) {
					_buffers[pitch] = buffer;

					finishedCount++;

					if(finishedCount >= total) {
						_def.resolve();
					}
				});
			});

			requirejs.undef('lib/soundfont/acoustic_grand_piano-ogg');
			pianoData.destroy();
			pianoData = null;
		})
	};

	Band.loadPack('instrument', 'piano', function(name, audioContext) {
		return {
			createSound: function(destination, pitch) {
				var o = audioContext.createBufferSource(),
					_buffer = _buffers[pitch];

				o.buffer = _buffer;
				o.connect(destination);

				return o;
			}
		};
	});

	return piano;
});