define([
	'_',
	'Backbone',
	'text!./templates/Options.jst',
	'shared/models/Options'
], function(_, Backbone, template, Option) {

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