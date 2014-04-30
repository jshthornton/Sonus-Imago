define([
	'Backbone',
	'underscore',
	'model/MoodPack/GB',
	'model/MoodPack/Alt'
], function(Backbone, _, GB, Alt) {
	var C = Backbone.Collection.extend({});

	var c = new C();
	c.add([
		new GB(),
		new Alt()
	]);

	return c;
});