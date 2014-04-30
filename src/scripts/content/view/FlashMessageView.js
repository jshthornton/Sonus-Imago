define([
	'Backbone',
	'underscore',
	'text!./template/FlashMessage.jst'
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
		_msg: 'Unknown error',
		/**
		 * The type of flash to display
		 * 
		 * @property type
		 * @type String
		 * @default 'notice'
		 */
		_type: 'notice',

		/**
		 * Initalises the view and auto renders it.
		 * 
		 * @method initialize
		 * @protected
		 */
		initialize: function(opts) {
			this._msg = opts.msg || this._msg;
			this._type = opts.type || this._type;

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
					msg: this._msg,
					type: this._type
				}),
				$el = $(compl);

			// Put message on the page
			$container.append($el);

			// Set the view's element to the root element from the template
			this.setElement($el[0]);
		},

		//Events
		events: {
			'click .SI_FlashMessage_dismiss': '_onDismiss'
		},

		/**
		 * Remove the flash message when the user clicks dismiss.
		 * 
		 * @event onDismiss
		 */
		_onDismiss: function() {
			this.remove();
		}
	});
});