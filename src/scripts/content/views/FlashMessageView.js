define([
	'Backbone',
	'underscore',
	'text!./templates/FlashMessage.jst'
], function(Backbone, _, template) {
	_.templateSettings.variable = 'it';

	var $container, // Container for all flash messages on the page
		tmplFn = _.template(template); // Compile the template

	/**
	 * View to control client flash messages.
	 *
	 * @class FlashMessageView
	 * @extends Backbone.View
	 */
	return Backbone.View.extend({
		/**
		 * The message to display
		 * 
		 * @property msg
		 * @type String
		 * @default 'Unknown error'
		 */
		msg: 'Unknown error',
		/**
		 * The type of flash to display
		 * 
		 * @property type
		 * @type String
		 * @default 'notice'
		 */
		type: 'notice',

		/**
		 * Initalises the view and auto renders it.
		 * 
		 * @method initialize
		 * @protected
		 */
		initialize: function(opts) {
			this.msg = opts.msg || this.msg;
			this.type = opts.type || this.type;

			this.render();
		},

		/**
		 * Render the flash message.
		 * Renders the flash message container if it has not previously been rendered.
		 * 
		 * @method render
		 */
		render: function() {
			// Render container if not already rendered
			if(!$container) {
				$container = $('<div></div>').prop('id', 'SI_FlashMessage_Container');
				$(document.body).append($container);
			}

			// Generate html from template
			var compl = tmplFn({
					msg: this.msg,
					type: this.type
				}),
				$el = $(compl);

			// Put message on the page
			$container.append($el);

			// Set the view's element to the root element from the template
			this.setElement($el[0]);
		},

		//Events
		events: {
			'click .SI_FlashMessage_dismiss': 'onDismiss'
		},

		/**
		 * Remove the flash message when the user clicks dismiss.
		 * 
		 * @event onDismiss
		 */
		onDismiss: function() {
			this.remove();
		}
	});
});