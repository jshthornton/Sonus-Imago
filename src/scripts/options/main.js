(function(win, undefined) {
	'use strict';

	var SHARED_PATH = '../../shared',
		SHARED_SCRIPTS_PATH = SHARED_PATH + '/scripts';

	require.config({
		baseUrl: chrome.extension.getURL('/options/scripts'),

		paths: {
			'jquery': SHARED_SCRIPTS_PATH + '/libs/jquery',
			'Class': SHARED_SCRIPTS_PATH + '/libs/Class',
			'_': SHARED_SCRIPTS_PATH + '/libs/lodash',
			'text': SHARED_SCRIPTS_PATH + '/libs/text',
			'Backbone': SHARED_SCRIPTS_PATH + '/libs/Backbone'
		},

		shim: {
			Class: [],
			
			Backbone: {
				deps: ['_', 'jquery'],
				exports: 'Backbone'
			}
		}
	});

	require([
		'_',
		'jquery',
		'views/OptionsView'
	], function(_, $, OptionsView) {
		_.templateSettings.variable = 'it';

		$(document).ready(function() {
			var optionsView = new OptionsView({
				el: document.body
			});
		});
	});
}(window));