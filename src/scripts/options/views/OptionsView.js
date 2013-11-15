define([
	'_',
	'Backbone',
	'text!./templates/Options.jst',
	'models/option'
], function(_, Backbone, template, option) {

	var V = Backbone.View.extend({
		//$volumeText
		//$volumeRange

		initialize: function() {
			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({
					option: option
				}),
				$tmpl = $(output);


			$('main', this.$el).html($tmpl);
		},

		//Events
		events: {
			'change #grid-size': 'onGridSizeChange',
			'change .volume': 'onVolumeChange'
		},

		onGridSizeChange: function(e) {
			var select = e.currentTarget;
			console.log(this, select);
		},

		onVolumeChange: function(e) {
			var val = e.currentTarget.value;

			this.$volumeText = this.$volumeText || $('#volume', this.$el);
			this.$volumeRange = this.$volumeRange || $('#volume-range', this.$el);

			if(this.$volumeText[0] !== e.currentTarget) {
				this.$volumeText[0].value = val;
			} else if(this.$volumeRange[0] !== e.currentTarget) {
				this.$volumeRange[0].value = val;
			}
		}
	});

	return V;
});