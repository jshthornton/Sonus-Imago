define([
	'_',
	'Backbone',
	'text!./templates/Options.jst'
], function(_, Backbone, template) {

	var V = Backbone.View.extend({

		initialize: function() {

			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({}),
				$tmpl = $(output);



			$('main', this.$el).html($tmpl);
		}
	});

	return V;
});