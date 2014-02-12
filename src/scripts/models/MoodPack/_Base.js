define([
	'Backbone',
	'underscore',
	'Band',
	'libs/instruments/piano'
], function(Backbone, _, Band, piano) {
	var MoodPack = Backbone.Model.extend({
		//_generateNotes
		//_createInstruments

		initialize: function() {
			_.bindAll(this);
		},

		generateMusic: function(segments) {
			var music = MoodPack.music;
			music.destroy();
			
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
	});

	MoodPack.music = new Band('acoustic_grand_piano-ogg', 'european');
	MoodPack.instruments = [];

	var audioContext = MoodPack.music.getAudioContext();
	piano.process(audioContext);

	return MoodPack;
});