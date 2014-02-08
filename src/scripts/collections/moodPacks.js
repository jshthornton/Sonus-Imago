define([
	'Backbone',
	'underscore',
	'models/MoodPack/GB',
	'localstorage'
], function(Backbone, _, GB) {
	var C = Backbone.Collection.extend({});

	var c = new C([
		new GB()
	], {

	});

	return c;
});