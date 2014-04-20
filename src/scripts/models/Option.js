define([
	'Backbone',
	'underscore',
	'./Option/KeyBinding',
	'localstorage'
], function(Backbone, _, KeyBinding) {
	var M = Backbone.Model.extend({
		localStorage: new Backbone.LocalStorage('option'),

		defaults: function() {
			return {
				id: 1,
				gridColumn: 8,
				gridRow: 8,
				volume: 100,
				moodPack: 'gb',
				triggerKey: new KeyBinding({
					__name__: 'KeyBinding',
					id: 'triggerKey',
					keyCode: 120,
					shift: false,
					alt: false,
					ctrl: false
				})
			};
		},

		parse: function(resp) {
			_.forOwn(resp, function(prop, key) {
				if(_.isObject(prop) && prop.__name__) {
					var model = prop.__name__;

					if(model === 'KeyBinding') {
						resp[key] = new KeyBinding(prop);
					}
				}
			}, this);

			return resp;
		},

		validate: function(attrs, options) {
			//Grid Column
			if(attrs.gridColumn < 4) {
				return 'Grid column can not be less than 4';
			}

			if(attrs.gridColumn > 10) {
				return 'Grid column can not be greater than 10';
			}

			//Grid Row
			if(attrs.gridRow < 4) {
				return 'Grid row can not be less than 4';
			}

			if(attrs.gridRow > 10) {
				return 'Grid row can not be greater than 10';
			}

			//Volume
			if(attrs.volume < 0) {
				return 'Volume can not be less than 0';
			}

			if(attrs.volume > 100) {
				return 'Volume can not be greater than 100';
			}

			//Mood Pack
		}
	});

	return new M();
});