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

	c.add([
		{id: 'gridSize', value: 5},
		{id: 'volume', value: 80},
		{id: 'moodPack', value: moodPacks.get('gb')}
	]);

	c.saveAll();

	console.log(c);

	return c;
});