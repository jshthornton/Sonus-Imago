define([
	'Backbone',
	'./AppCollection',
	'./mood-packs',
	'localstorage'
], function(Backbone, AppCollection, moodPacks) {
	'use strict';

	//console.log(moodPacks)

	var C = AppCollection.extend({
			localStorage: new Backbone.LocalStorage('options')
		}),
		c = new C();

	/*c.reset([
		{id: 'gridSize', value: 5},
		{id: 'volume', value: 80},
		{id: 'moodPack', value: moodPacks.get('gb')}
	]);*/

	var gridSizes = [{label: '4x4', value: 4}, {label: '5x5', value: 5}, {label: '6x6', value: 6}];

	c.add([
		{id: 'gridSize', value: gridSizes[1], sizes: gridSizes},
		{id: 'volume', value: 80},
		{id: 'moodPack', value: moodPacks.get('gb')}
	]);

	gridSizes = null;

	c.saveAll();

	console.log(c);

	return c;
});