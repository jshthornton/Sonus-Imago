define([
	'Backbone'
], function(Backbone) {
	'use strict';

	var M = Backbone.Model.extend({
		defaults: {
			gridSize: 5,
			volume: 80,
			moodPack: 'gb'
		}
	});

	return new M();
});