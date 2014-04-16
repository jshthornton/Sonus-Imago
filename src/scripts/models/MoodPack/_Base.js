define([
	'Backbone',
	'underscore',
	'libs/music',
	'libs/instruments/piano',
	'models/option'
], function(Backbone, _, music, piano, option) {
	var MoodPack = Backbone.Model.extend({
		//_generateNotes
		//_createInstruments

		initialize: function() {
			_.bindAll(this);
		},

		generateMusic: function(segments) {
			var volume = option.get('volume');

			music.destroy();
			
			music.setMasterVolume(volume / 100);
			music.setTimeSignature(4, 4);
			music.setTempo(160);

			music.instruments.length = 0;
			this._createInstruments();

			for(var i = 0; i < segments.length; i++) {
				this._generateNotes(segments[i]);
			}

			this._finishInstruments();

			music.end();

			return music;
		},

		_finishInstruments: function() {
			if(music.instruments) {
				_.forEach(music.instruments, function(instrument) {
					instrument.finish();
				});
			}
		}
	});

	return MoodPack;
});