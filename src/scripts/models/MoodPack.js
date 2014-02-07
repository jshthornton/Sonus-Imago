define([
	'Backbone',
	'underscore',
	'Band'
], function(Backbone, _, Band) {
	var MoodPack = Backbone.Model.extend({
		//_generateNotes
		//_createInstruments

		initialize: function() {
			_.bindAll(this);
		},

		generateMusic: function(segments) {
			var music = MoodPack.music;
			music.setTimeSignature(4, 4);
			music.setTempo(120);

			MoodPack.instruments.length = 0;
			this._createInstruments();

			for(var i = 0; i < segments.length; i++) {
				this._generateNotes(segments[i]);
			}

			this._finishInstruments();

			music.end();

			music.play();

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

	MoodPack.music = new Band('equalTemperament', 'european');
	MoodPack.instruments = [];

	return MoodPack;
});