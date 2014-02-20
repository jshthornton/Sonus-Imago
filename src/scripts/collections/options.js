define([
	'Backbone',
	'./AppCollection',
	'models/Option',
	'models/Option/GridSize',
	'models/Option/KeyBinding',
	'localstorage'
], function(Backbone, AppCollection, Option, GridSize, KeyBinding) {
	'use strict';

	var C = AppCollection.extend({
			localStorage: new Backbone.LocalStorage('options'),

			model: function(attr, options) {
				var cls = Option;

				if(typeof attr.__cast !== undefined) {
					switch(attr.__cast) {
						case 'GridSize':
							cls = GridSize;
							break;
						case 'KeyBinding':
							cls = KeyBinding;
							break;
						default:
							cls = Option;
					}
				}

				return new cls(attr, options);
			},

			resetInitial: function() {
				this.reset();

				this.add([
					{
						__cast: 'GridSize',
						value: '4x4'
					},
					{
						id: 'volume',
						value: 80
					},
					{
						id: 'moodPack',
						value: 'gb'
					},
					{
						__cast: 'KeyBinding',
						id: 'triggerKey',
						keyCode: 120,
						shift: false,
						alt: false,
						ctrl: false
					}
				])
			}
		});

	

	return new C();
});