require([
	'underscore',
	'jquery',
	'models/option',
	'options/views/OptionsView'
], function(_, $, option, OptionsView) {
	'use strict';

	_.templateSettings.variable = 'it';

	option.fetch({
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