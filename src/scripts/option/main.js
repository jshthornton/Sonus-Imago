require([
	'underscore',
	'jquery',
	'model/option',
	'option/view/OptionsView'
], function(_, $, option, OptionsView) {
	'use strict';

	_.templateSettings.variable = 'it';

	var main = {
		init: function() {
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
		}
	};

	main.init();
});