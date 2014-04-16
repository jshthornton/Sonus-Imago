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
				gridColumn: 4,
				gridRow: 4,
				volume: 80,
				moodPack: 'gb',
				triggerKey: new KeyBinding({
					__name__: 'KeyBinding',
					id: 'triggerKey',
					keyCode: 120,
					shift: false,
					alt: false,
					ctrl: false
				})
			}
		},

		parse: function(resp) {
			_.forOwn(resp, function(prop, key) {
				if(_.isObject(prop) && prop['__name__']) {
					var model = prop['__name__'];

					if(model === 'KeyBinding') {
						resp[key] = new KeyBinding(prop);
					}
				}
			}, this);

			return resp;
		}
	});

	return new M();
});