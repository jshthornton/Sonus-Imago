(function(win) {
	'use strict';

	var config = {
			baseUrl: chrome.extension.getURL('/scripts'),

			paths: {
				'jquery': 'libs/jquery',
				'Class': 'libs/Class',
				'underscore': 'libs/lodash',
				'text': 'libs/text',
				'Backbone': 'libs/Backbone',
				'localstorage': 'libs/Backbone.localStorage',
				'Band': 'libs/Band'
			},

			shim: {
				Class: {
					exports: 'Class'
				},
				Backbone: {
					deps: ['underscore', 'jquery'],
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