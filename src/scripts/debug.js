define([
	'./config'
], function(config) {
	return {
		log: function() {
			if(config.DEBUG) {
				console.log.apply(console, arguments);
			}
		},

		groupCollapsed: function() {
			if(config.DEBUG) {
				console.groupCollapsed.apply(console, arguments);
			}
		},

		groupEnd: function() {
			if(config.DEBUG) {
				console.groupEnd();
			}
		}
	};
});