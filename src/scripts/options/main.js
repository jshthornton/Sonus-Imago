require([
	'underscore',
	'jquery',
	'collections/options',
	'options/views/OptionsView'
], function(_, $, options, OptionsView) {
	'use strict';

	options.fetch();

	_.templateSettings.variable = 'it';

	$(document).ready(function() {
		var optionsView = new OptionsView({
			el: document.body
		});
	});
});