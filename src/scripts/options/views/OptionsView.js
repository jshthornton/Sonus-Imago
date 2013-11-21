define([
	'underscore',
	'Backbone',
	'text!./templates/Options.jst',
	'collections/options',
	'collections/mood-packs'
], function(_, Backbone, template, options, moodPacks) {
	'use strict';

	var V = Backbone.View.extend({
		//$volumeText
		//$volumeRange

		initialize: function() {
			//console.log(options)
			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({
					options: options,
					moodPacks: moodPacks
				}),
				$tmpl = $(output);


			$('main', this.$el).html($tmpl);
		},

		//Events
		events: {
			'change #grid-size': 'onGridSizeChange',
			'change .volume': 'onVolumeChange',
			'change #mood-pack': 'onMoodPackChange',
			'submit #options': 'onSubmit'
		},

		onGridSizeChange: function(e) {
			var select = e.currentTarget,
				value = parseInt(select.selectedOptions[0].value, 10),
				gridSize = options.get('gridSize'),
				size;

			size = _.find(gridSize.get('sizes'), function(_size) {
				return value === _size.value;
			});

			gridSize.set('value', size);
		},

		onVolumeChange: _.throttle(function(e) {
			var val = e.currentTarget.value;

			this.$volumeText = this.$volumeText || $('#volume', this.$el);
			this.$volumeRange = this.$volumeRange || $('#volume-range', this.$el);

			if(this.$volumeText[0] !== e.currentTarget) {w
				this.$volumeText[0].value = val;
			} else if(this.$volumeRange[0] !== e.currentTarget) {
				this.$volumeRange[0].value = val;
			}

			options.get('volume').set('value', val);
		}, 200),

		onMoodPackChange: function() {

		},

		onSubmit: function(e) {
			e.preventDefault();

			options.saveAll();
		}
	});

	return V;
});