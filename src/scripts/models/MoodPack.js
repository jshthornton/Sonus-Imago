define([
	'Backbone'
], function(Backbone) {
	var M = Backbone.Model.extend({
		defaults: {
			id: null,
			name: null
		}
	});

	return M;
});