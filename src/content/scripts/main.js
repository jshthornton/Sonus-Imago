;(function(win, undefined) {
	'use strict';

	var SHARED_PATH = '../../shared',
		SHARED_SCRIPTS_PATH = SHARED_PATH + '/scripts';

	require.config({
		baseUrl: chrome.extension.getURL('/content/scripts'),

		paths: {
			'jquery': SHARED_SCRIPTS_PATH + '/libs/jquery',
			'Class': SHARED_SCRIPTS_PATH + '/libs/Class',
			'_': SHARED_SCRIPTS_PATH + '/libs/lodash',
			'text': SHARED_SCRIPTS_PATH + '/libs/text'
		},

		shim: {
			Class: []
		}
	});

	require([
		'jquery'
	], function($) {
		console.log('hello world!')
	});
}(window));