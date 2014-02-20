require([
	'underscore',
	'jquery',
	'collections/options',
	'options/views/OptionsView'
], function(_, $, options, OptionsView) {
	'use strict';

	_.templateSettings.variable = 'it';

	options.fetch({
		reset: true,
		success: function() {
			$(document).ready(function() {
				var optionsView = new OptionsView({
					el: document.body
				});
			});
		}

	});
});