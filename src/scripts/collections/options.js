define([
	'Backbone',
	'./AppCollection',
	'localstorage'
], function(Backbone, AppCollection) {
	'use strict';

	var C = AppCollection.extend({
			localStorage: new Backbone.LocalStorage('options'),

			resetInitial: function() {
				var gridSizes = [
					{label: '4x4', id: '4x4', rows: 4, cols: 4}, 
					{label: '5x5', id: '5x5', rows: 5, cols: 5}, 
					{label: '6x6', id: '6x6', rows: 6, cols: 6}
				];

				console.log(gridSizes[1].value);
				this.reset([
					{id: 'gridSize', value: gridSizes[1].id, sizes: gridSizes},
					{id: 'volume', value: 80},
					{id: 'moodPack', value: 'gb'}
				]);

				gridSizes = null;
			}
		});

	return new C();
});