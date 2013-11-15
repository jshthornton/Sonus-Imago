require([
	'_',
	'jquery',
	'options/views/OptionsView'
], function(_, $, OptionsView) {
	'use strict';

	_.templateSettings.variable = 'it';

	$(document).ready(function() {
		var optionsView = new OptionsView({
			el: document.body
		});
	});
});