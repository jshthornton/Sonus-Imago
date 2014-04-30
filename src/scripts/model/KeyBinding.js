define([
	'Backbone'
], function(Backbone) {
	var KeyBinding = Backbone.Model.extend({
		defaults: function() {
			return {
				id: null,
				keyCode: null,
				shift: false,
				alt: false,
				ctrl: false
			};
		}
	});
	
	return KeyBinding;
});