define([
	'Backbone',
	'models/MoodPack'
], function(Backbone, MoodPack) {
	var C = Backbone.Collection.extend({});

	return new C([{
		id: 'gb',
		name: 'Great Britain'
	}], {
		model: MoodPack
	});
});