(function(win) {
	'use strict';

	var config = {
			baseUrl: chrome.extension.getURL('/scripts'),

			paths: {
				'jquery': 'lib/jquery',
				'Class': 'lib/Class',
				'underscore': 'lib/lodash',
				'text': 'lib/text',
				'Backbone': 'lib/Backbone',
				'localstorage': 'lib/Backbone.localStorage',
				'Band': 'lib/Band'
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