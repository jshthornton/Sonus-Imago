define([
	'../Option'
], function(Option) {
	var KeyBinding = Option.extend({
		defaults: function() {
			return {
				id: null,
				keyCode: null,
				shift: false,
				alt: false,
				ctrl: false
			}
		}
	});
	
	return KeyBinding;
});