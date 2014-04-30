({
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
	},

	optimize: 'uglify2'
})