(function(win) {
	'use strict';

	var config = {
			baseUrl: chrome.extension.getURL('/scripts'),

			paths: {
				'jquery': 'libs/jquery',
				'Class': 'libs/Class',
				'_': 'libs/lodash',
				'text': 'libs/text',
				'Backbone': 'libs/Backbone'
			},

			shim: {
				Class: [],
				Backbone: {
					deps: ['_', 'jquery'],
					exports: 'Backbone'
				}
			}
		};

	if('require' in win) {
		require.config(config);
	} else {
		win.require = config;
	}

	config = null;
}(window));