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

		initialize: function(opts) {
			this.msg = opts.msg;

			this.render();

			var $flashMessages = $('> .SI_FlashMessage', $container);
			if($flashMessages.length === 1) {
				$('> .SI_FlashMessage_msg', this.$el).focus();
			}
		},

		render: function() {
			if(!$container) {
				$container = $('<div></div>').prop('id', 'SI_FlashMessage_Container');
				$(document.body).append($container);
			}

			var compl = tmplFn({
					msg: this.msg
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
			var _this = this,
				$flashMessages = $('> .SI_FlashMessage', $container),
				$nextFlashMessage;

			$flashMessages.each(function(index, node) {
				if(node === _this.el) {
					return;
				}

				$nextFlashMessage = $(node);
				return false;
			});

			if(!$nextFlashMessage) {
				$(document).trigger('SI_restore_focus');
			} else {
				$('> .SI_FlashMessage_msg', $nextFlashMessage).focus();
			}

			this.remove();
		}
	});
});