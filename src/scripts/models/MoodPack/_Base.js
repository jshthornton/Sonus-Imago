define([
	'Backbone',
	'underscore',
	'Band',
	'libs/instruments/piano',
	'collections/options'
], function(Backbone, _, Band, piano, options) {
	var MoodPack = Backbone.Model.extend({
		//_generateNotes
		//_createInstruments

		initialize: function() {
			_.bindAll(this);
		},

		generateMusic: function(segments) {
			var music = MoodPack.music,
				volume = options.get('volume').get('value');

			music.destroy();
			
			music.setMasterVolume(volume / 100);
			music.setTimeSignature(4, 4);
			music.setTempo(120);


			MoodPack.instruments.length = 0;
			this._createInstruments();

			for(var i = 0; i < segments.length; i++) {
				this._generateNotes(segments[i]);
			}

			this._finishInstruments();

			music.end();

			return music;
		},

		_finishInstruments: function() {
			if(MoodPack.instruments) {
				_.forEach(MoodPack.instruments, function(instrument) {
					instrument.finish();
				});
			}
		},

		getMusicInstance: function() {
			return MoodPack.music;
		}
	});

	MoodPack.music = new Band('acoustic_grand_piano-ogg', 'european');
	MoodPack.instruments = [];

	return MoodPack;
});