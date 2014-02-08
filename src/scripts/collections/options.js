define([
	'Backbone',
	'./AppCollection',
	'models/Option',
	'models/Option/GridSize',
	'localstorage'
], function(Backbone, AppCollection, Option, GridSize) {
	'use strict';

	var C = AppCollection.extend({
			localStorage: new Backbone.LocalStorage('options'),

			resetInitial: function() {
				this.reset([
					new GridSize({
						value: '4x4'
					}),
					new Option({
						id: 'volume',
						value: 80
					}),
					new Option({
						id: 'moodPack',
						value: 'gb'
					})
				]);
			}
		});

	

	return new C();
});