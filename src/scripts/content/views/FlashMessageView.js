define([
	'Backbone',
	'underscore',
	'text!./templates/FlashMessage.jst'
], function(Backbone, _, template) {
	_.templateSettings.variable = 'it';

	var $container,
		tmplFn = _.template(template);

	return Backbone.View.extend({
		msg: 'Unknown error',
		type: 'notice',

		initialize: function(opts) {
			this.msg = opts.msg || this.msg;
			this.type = opts.type || this.type;

			this.render();
		},

		render: function() {
			if(!$container) {
				$container = $('<div></div>').prop('id', 'SI_FlashMessage_Container');
				$(document.body).append($container);
			}

			var compl = tmplFn({
					msg: this.msg,
					type: this.type
				}),
				$el = $(compl);

			$container.append($el);

			this.setElement($el[0]);
		},

		//Events
		events: {
			'click .SI_FlashMessage_dismiss': 'onDismiss'
		},

		onDismiss: function() {
			this.remove();
		}
	});
});