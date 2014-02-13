define([
	'Band',
	'jquery',
	'libs/Base64Binary',
	'libs/soundfont/acoustic_grand_piano-ogg'
], function(Band, $, Base64Binary, pianoData) {
	var _def = new $.Deferred(),
		_buffers = {},
		total,
		finishedCount;

	var piano = {
		ready: _def.promise(),
		process: function(audioContext) {
			if(_def.state() === 'resolved') return;

			total = 0;
			finishedCount = 0;

			_.forOwn(pianoData, function(base64_str, pitch) {
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
		}
	};

	Band.loadPack('instrument', 'piano', function(name, audioContext) {
		return {
			createSound: function(destination, base64_str, pitch) {
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