define([
	'Backbone'
], function(Backbone) {
	var M = Backbone.Model.extend({
		defaults: {
			gridSize: 5,
			volume: 80,
			moodPack: 'gb'
		}
	});

	return new M();
});