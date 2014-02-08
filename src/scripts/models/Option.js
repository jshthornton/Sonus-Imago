define([
	'Backbone',
	'underscore'
], function(Backbone, _) {
	var M = Backbone.Model.extend({
		defaults: function() {
			return {
				id: null,
				value: null
			}
		}
	});

	return M;
});